import {inject, Injectable, OnInit} from '@angular/core';
import {Socket} from "ngx-socket-io";
import {EMPTY, map, merge, switchMap, tap} from "rxjs";
import {Chat} from "../models/chat";
import {Updates} from "../models/updates";
import {SocketResp} from "../models/socket_resp";
import {Message} from "../models/message";
import {MessageAddContent} from "../models/message_add_content";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private readonly socket: Socket = inject(Socket)
  // private readonly authService: FirebaseService = inject(FirebaseService);

  private connected: boolean = false;

  init() {
    // const pipe2 = this.authService.userChanged$.pipe(tap(user => {
    //   this.socket.disconnect()
    //   this.connected = false;
    //   if (user) {
    //     user.getIdToken().then(token => this.socket.ioSocket['auth'] = token);
    //     this.connect();
    //   }
    // }))
    // const pipe1 = this.authService.tokenChanged$.pipe(tap(token => {
    //   this.socket.ioSocket['auth'] = token;
    // }))
    // return merge(pipe1, pipe2).pipe(switchMap(() => EMPTY))
  }

  disconnect() {
    this.socket.disconnect();
    this.connected = false;
  }

  connect(token: string | null | undefined) {
    if (token !== undefined)
    {
      this.socket.ioSocket['auth'] = token
      if (token === null)
        return;
    }
    console.log("Connecting...")
    if (!this.connected) {
      this.socket.connect(err => {
        console.error(err)
      })
    }
    this.socket.emit('updates_request', '2001-01-01T00:00:00.000000')
  }

  private fromEvent<T>(key: string){
    return this.socket.fromEvent<SocketResp<T>>(key).pipe(map(resp => {
      return resp.data;
    }));
  }

  newChats$ = this.fromEvent<Chat[]>('new_chats');

  deleteChats$ = this.fromEvent<string[]>('delete_chats');

  newMessages$ = this.fromEvent<Message[]>('new_messages');

  deleteMessages$ = this.fromEvent<string[]>('delete_messages');

  messageAddContent$ = this.fromEvent<MessageAddContent>('message_add_content');

  updates$ = this.fromEvent<Updates>('updates_response');

  newMessage(chatId: string, role: string, content: string) {
    this.socket.emit('new_message', {
      chat_uuid: chatId,
      role: role,
      content: content
    })
  }
}
