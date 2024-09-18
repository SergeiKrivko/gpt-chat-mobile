import {inject, Injectable} from '@angular/core';
import {SocketService} from "./socket.service";
import {of, tap} from "rxjs";
import {Chat} from "../models/chat";
import {Message} from "../models/message";

@Injectable({
  providedIn: 'root'
})
export class ChatsService {

  chats: Chat[] = [];
  messages: { [key: string]: Message[] } = {};

  private readonly socketService = inject(SocketService);

  getChats() {
    return of(this.chats);
  }

  getChat(chatId: string) {
    return this.chats.filter(chat => chat.uuid == chatId)[0];
  }

  getMessages(chatId: string) {
    if (!(chatId in this.messages))
      this.messages[chatId] = [];
    return of(this.messages[chatId]);
  }

  newChats$ = this.socketService.newChats$.pipe(tap(chats => {
    chats.forEach(chat => {
      this.chats.push(chat);
      this.messages[chat.uuid] = [];
    })
  }))

  deleteChats$ = this.socketService.deleteChats$.pipe(tap(chatIds => {
    // chats.forEach(chat => {
    //   this.chats.push(chat);
    //   this.messages[chat.uuid] = [];
    // })
  }))

  newMessages$ = this.socketService.newMessages$.pipe(tap(messages => {
    messages.forEach(message => this.messages[message.chat_uuid].push(message))
  }))

  messageAddContent$ = this.socketService.messageAddContent$.pipe(tap(message => {
    const messages = this.messages[message.chat_uuid].filter(m => m.uuid === message.uuid);
    if (messages)
      messages[0].content += message.content;
  }))

  updates$ = this.socketService.updates$.pipe(tap(updates => {
    updates.new_chats.forEach(chat => {
      this.chats.push(chat);
      this.messages[chat.uuid] = [];
    })
    updates.new_messages.forEach(message => this.messages[message.chat_uuid].push(message))
  }))

  newMessage(chatId: string, content: string) {
    this.socketService.newMessage(chatId, 'user', content);
  }
}
