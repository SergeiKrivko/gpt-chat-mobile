import {inject, Injectable} from '@angular/core';
import {SocketService} from "./socket.service";
import {BehaviorSubject, EMPTY, map, merge, shareReplay, switchMap, tap} from "rxjs";
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

  private readonly chats$$ = new BehaviorSubject<Chat[]>([]);
  private readonly allMessages$$ = new BehaviorSubject(new Map<string, Message[]>());
  private readonly models$$ = new BehaviorSubject<string[]>([]);
  private readonly gptWriting$$ = new BehaviorSubject(new Map<string, boolean>());

  private readonly socketService = inject(SocketService);
  private readonly storage = inject(StorageService);
  private readonly http = inject(HttpClient);

  readonly chats$ = this.chats$$.pipe(
    shareReplay(1),
    tap(chats => this.storage.set('chats', chats)),
    map(chats => chats.sort((c1, c2) => {
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
      map(messages => messages.get(chatId)?.sort(
        (m1, m2) => m1.created_at > m2.created_at ? 1 : -1
      ) ?? []),
    );
  }

  getGptWriting(chatId: string) {
    return this.gptWriting$$.pipe(
      map(messages => messages.get(chatId) ?? false),
    );
  }

  getMessage(chatId: string, id: string) {
    return this.allMessages$$.value.get(chatId)?.filter(m => m.uuid == id)[0];
  }

  private readonly newChats$ = this.socketService.fromEvent<Chat[]>('new_chats').pipe(
    tap(chats => {
      this.chats$$.next([...this.chats$$.value, ...chats]);
    })
  );

  private readonly deleteChats$ = this.socketService.fromEvent<string[]>('delete_chats').pipe(
    tap(chatIds => {
      this.chats$$.next(this.chats$$.value.filter(({uuid}) => !chatIds.includes(uuid)));
    })
  );

  private readonly updateChat$ = this.socketService.fromEvent<Chat>('update_chat').pipe(
    tap(chat => {
      this.chats$$.next([...this.chats$$.value.filter(({uuid}) => chat.uuid !== uuid), chat]);
    })
  );

  private readonly newMessages$ = this.socketService.fromEvent<Message[]>('new_messages').pipe(
    tap(messages => {
      const newMap = new Map<string, Message[]>(this.allMessages$$.value);
      messages.forEach(message => {
        const chatMessages = newMap.get(message.chat_uuid) ?? [];
        chatMessages.push(message);
        newMap.set(message.chat_uuid, chatMessages);
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
      const newMap = new Map<string, Message[]>(this.allMessages$$.value);
      newMap.forEach((messages, chatId) => {
        newMap.set(chatId, messages.filter(({uuid}) => !messageIds.includes(uuid)))
      })
      this.allMessages$$.next(newMap);
    })
  );

  private readonly messageAddContent$ = this.socketService.fromEvent<MessageAddContent>('message_add_content').pipe(
    tap(content => {
      const newMap = new Map<string, Message[]>(this.allMessages$$.value);
      const messages = newMap.get(content.chat);
      if (messages) {
        const index = messages.findIndex(m => m.uuid == content.uuid);
        if (index != -1) {
          const message = messages[index];
          messages[index] = {
            uuid: message.uuid,
            chat_uuid: message.chat_uuid,
            created_at: message.created_at,
            deleted_at: message.deleted_at,
            role: message.deleted_at,
            content: message.content + content.content,
            reply: message.reply,
            model: message.model,
            temperature: message.temperature,
          };
          this.allMessages$$.next(newMap);
        } else {
          console.warn(`Adding to no exist message ${content.uuid} (chat ${content.chat})`);
        }
      }
    })
  );

  readonly gptError$ = this.socketService.fromEvent<string>('gpt_error').pipe(
    tap(err => console.error(`GPT error: ${err}`)),
  )

  private readonly updates$ = this.socketService.fromEvent<Updates>('updates_response').pipe(
    tap(updates => {
      this.chats$$.next([...this.chats$$.value.filter(({uuid}) => !updates.deleted_chats.includes(uuid)), ...updates.new_chats]);
      const newMap = new Map<string, Message[]>(this.allMessages$$.value);
      updates.new_messages.forEach(message => {
        const chatMessages = newMap.get(message.chat_uuid) ?? [];
        chatMessages.push(message);
        newMap.set(message.chat_uuid, chatMessages);
      });
      newMap.forEach((messages, chatId) => {
        newMap.set(chatId, messages.filter(({uuid}) => !updates.deleted_messages.includes(uuid)))
      })
      this.allMessages$$.next(newMap);
    })
  );

  init() {
    const pipe1 = this.storage.get<Chat[]>('chats').pipe(
      tap(chats => {
        console.log(`Local chats: ${chats}`);
        if (chats)
          this.chats$$.next(chats);
      })
    );
    const pipe2 = this.storage.get<Map<string, Message[]>>('messages').pipe(
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

  deleteMessage(id: string) {
    this.socketService.emit('delete_message', id);
  }
}
