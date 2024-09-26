import {inject, Injectable} from '@angular/core';
import {SocketService} from "./socket.service";
import {BehaviorSubject, EMPTY, map, merge, shareReplay, switchMap, tap} from "rxjs";
import {Chat} from "../models/chat";
import {Message} from "../models/message";
import {MessageAddContent} from "../models/message_add_content";
import {Updates} from "../models/updates";

@Injectable({
  providedIn: 'root'
})
export class ChatsService {

  private readonly chats$$ = new BehaviorSubject<Chat[]>([]);
  private readonly allMessages$$ = new BehaviorSubject(new Map<string, Message[]>());

  private readonly socketService = inject(SocketService);

  readonly chats$ = this.chats$$.pipe(shareReplay(1));
  readonly allMessages$ = this.allMessages$$.pipe(shareReplay(1));

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
      const message = newMap.get(content.chat)?.find(message => message.uuid === content.uuid);
      if (message) {
        message.content += content.content;
        this.allMessages$$.next(newMap);
      } else {
        console.warn(`Adding to no exist message ${content.uuid} (chat ${content.chat})`);
      }
    })
  );

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
    return merge(
      this.newChats$, this.deleteChats$, this.newMessages$, this.messageAddContent$, this.deleteMessages$, this.updates$
    ).pipe(switchMap(() => EMPTY))
  }

  newMessage(chatId: string, content: string) {
    this.socketService.emit('new_message', {
      chat_uuid: chatId,
      role: 'user',
      content: content
    }, true);
  }

  newChat() {
    this.socketService.emit('new_chat');
  }

  deleteChat(id: string){
    this.socketService.emit('delete_chat', id);
  }

  deleteMessage(id: string){
    this.socketService.emit('delete_message', id);
  }
}
