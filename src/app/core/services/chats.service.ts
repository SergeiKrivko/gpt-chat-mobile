import {inject, Injectable} from '@angular/core';
import {SocketService} from "./socket.service";
import {BehaviorSubject, EMPTY, map, merge, Observable, shareReplay, switchMap, tap} from "rxjs";
import {Chat} from "../models/chat";
import {Message} from "../models/message";
import {MessageAddContent} from "../models/message_add_content";
import {Updates} from "../models/updates";
import {StorageService} from "./storage.service";
import {ReplyCreate} from "../models/reply_create";
import {ChatUpdate} from "../models/chat_update";
import {HttpClient} from "@angular/common/http";
import {HttpResp} from "../models/socket_resp";

@Injectable({
  providedIn: 'root'
})
export class ChatsService {

  private readonly chats$$ = new BehaviorSubject<Map<string, Chat>>(new Map());
  private readonly allMessages$$ = new BehaviorSubject(new Map<string, Message>());
  private readonly models$$ = new BehaviorSubject<string[]>([]);
  private readonly gptWriting$$ = new BehaviorSubject(new Map<string, boolean>());

  private readonly socketService = inject(SocketService);
  private readonly storage = inject(StorageService);
  private readonly http = inject(HttpClient);

  readonly chats$ = this.chats$$.pipe(
    shareReplay(1),
    tap(chats => this.storage.set('chats', chats)),
    map(chats => [...chats.values()].sort((c1, c2) => {
      if (c1.pinned !== c2.pinned) {
        return c1.pinned ? -1 : 1;
      }
      return c1.created_at > c2.created_at ? -1 : 1;
    }))
  );
  readonly allMessages$ = this.allMessages$$.pipe(
    shareReplay(1),
    tap(messages => this.storage.set('messages', messages))
  );
  readonly gptWriting$ = this.gptWriting$$.pipe(
    shareReplay(1),
  );
  readonly models$ = this.models$$.pipe(
    shareReplay(1),
  );

  getChat(chatId: string) {
    return this.chats$.pipe(
      map(chats => chats.find(chat => chat.uuid === chatId) ?? null)
    );
  }

  getMessages(chatId: string) {
    return this.allMessages$.pipe(
      map(messages => [...messages.values()].filter(m => m.chat_uuid === chatId).sort(
        (m1, m2) => m1.created_at > m2.created_at ? 1 : -1
      ) ?? []),
    );
  }

  getGptWriting(chatId: string) {
    return this.gptWriting$$.pipe(
      map(messages => messages.get(chatId) ?? false),
    );
  }

  getMessage(id: string): Message | undefined {
    return this.allMessages$$.value.get(id);
  }

  private readonly newChats$ = this.socketService.fromEvent<Chat[]>('new_chats').pipe(
    tap(chats => {
      const newMap = new Map(this.chats$$.value);
      chats.forEach(chat => newMap.set(chat.uuid, chat));
      this.chats$$.next(newMap);
    })
  );

  private readonly deleteChats$ = this.socketService.fromEvent<string[]>('delete_chats').pipe(
    tap(chatIds => {
      const newMap = new Map(this.chats$$.value);
      chatIds.forEach(chatId => newMap.delete(chatId));
      this.chats$$.next(newMap);
    })
  );

  private readonly updateChat$ = this.socketService.fromEvent<Chat>('update_chat').pipe(
    tap(chat => {
      const newMap = new Map(this.chats$$.value);
      newMap.set(chat.uuid, chat);
      this.chats$$.next(newMap);
    })
  );

  private readonly newMessages$ = this.socketService.fromEvent<Message[]>('new_messages').pipe(
    tap(messages => {
      const newMap = new Map<string, Message>(this.allMessages$$.value);
      messages.forEach(message => {
        newMap.set(message.uuid, message);
      });
      this.allMessages$$.next(newMap);
    })
  );

  private readonly messageFinished$ = this.socketService.fromEvent<Message>('message_finish').pipe(
    tap(message => {
      const newMap = new Map<string, boolean>(this.gptWriting$$.value);
      newMap.set(message.chat_uuid, false);
      this.gptWriting$$.next(newMap);
    })
  );

  private readonly deleteMessages$ = this.socketService.fromEvent<string[]>('delete_messages').pipe(
    tap(messageIds => {
      const newMap = new Map<string, Message>(this.allMessages$$.value);
      messageIds.forEach(messageId => {
        newMap.delete(messageId);
      })
      this.allMessages$$.next(newMap);
    })
  );

  private readonly messageAddContent$ = this.socketService.fromEvent<MessageAddContent>('message_add_content').pipe(
    tap(content => {
      const newMap = new Map(this.allMessages$$.value);
      const message = newMap.get(content.uuid);
      if (message) {
        message.content += content.content
        this.allMessages$$.next(newMap);
      }
    })
  );

  readonly gptError$ = this.socketService.fromEvent<string>('gpt_error').pipe(
    tap(err => console.error(`GPT error: ${err}`)),
  )

  private readonly updates$ = this.socketService.fromEvent<Updates>('updates_response').pipe(
    tap(updates => {
      const newMap = new Map(this.chats$$.value);
      updates.new_chats.forEach(chat => newMap.set(chat.uuid, chat));
      updates.deleted_chats.forEach(chatId => newMap.delete(chatId));
      updates.updated_chats.filter(chat => newMap.delete(chat.uuid));
      this.chats$$.next(newMap);

      const messagesMap = new Map(this.allMessages$$.value);
      updates.new_messages.forEach(message => {
        messagesMap.set(message.uuid, message);
      });
      updates.deleted_messages.forEach(messageId => messagesMap.delete(messageId));
      this.allMessages$$.next(messagesMap);
    })
  );

  init() {
    const pipe1 = this.storage.get<Map<string, Chat>>('chats').pipe(
      tap(chats => {
        console.log(`Local chats: ${chats}`);
        if (chats)
          this.chats$$.next(chats);
      })
    );
    const pipe2 = this.storage.get<Map<string, Message>>('messages').pipe(
      tap(messages => {
        console.log(`Local messages: ${messages}`);
        if (messages)
          this.allMessages$$.next(messages);
      })
    );
    const pipe3 = this.http.get<HttpResp<string[]>>('https://gptchat-api.nachert.art/api/v1/gpt/models').pipe(
      map(resp => {
        this.models$$.next(resp.data);
      })
    );
    return merge(
      pipe1, pipe2, pipe3,
      this.newChats$, this.deleteChats$, this.updateChat$,
      this.newMessages$, this.messageAddContent$, this.deleteMessages$, this.messageFinished$,
      this.updates$
    ).pipe(switchMap(() => EMPTY))
  }

  newMessage(chatId: string, content: string, reply: ReplyCreate[] = []) {
    this.socketService.emit('new_message', {
      chat_uuid: chatId,
      role: 'user',
      content: content,
      reply: reply,
    }, true);
    const newMap = new Map<string, boolean>(this.gptWriting$$.value);
    newMap.set(chatId, true);
    this.gptWriting$$.next(newMap);
  }

  newChat() {
    this.socketService.emit('new_chat');
  }

  deleteChat(id: string) {
    this.socketService.emit('delete_chat', id);
  }

  updateChat(id: string, chat: ChatUpdate) {
    this.socketService.emit('update_chat', id, chat);
  }

  updateChatImmediately(id: string, chat: ChatUpdate) {
    this.socketService.emit('update_chat', id, chat);
    const newMap = new Map(this.chats$$.value);
    let oldChat = newMap.get(id);
    if (oldChat) {
      let newChat: Chat = {
        uuid: id,
        created_at: oldChat.created_at,
        deleted_at: oldChat.deleted_at,
        name: chat.name ?? oldChat.name,
        model: chat.model ?? oldChat.model,
        context_size: chat.context_size ?? oldChat.context_size,
        temperature: chat.temperature ?? oldChat.temperature,
        pinned: chat.pinned ?? oldChat.pinned,
        archived: chat.archived ?? oldChat.archived,
        color: oldChat.color,
      }
      newMap.set(id, newChat);
    }
    this.chats$$.next(newMap);
  }

  deleteMessage(id: string) {
    this.socketService.emit('delete_message', id);
  }
}
