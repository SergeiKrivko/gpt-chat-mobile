import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {v4 as uuid4} from 'uuid';
import {FirebaseService} from "./firebase.service";
import {User} from "@angular/fire/auth";

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
  remote_last: number;
  sync: boolean;
  ctime: number;
  utime: number;
}

export interface Message {
  id: string;
  chat_id: string;
  role: string;
  content: string;
  ctime: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public chats: Chat[] = []
  public remote_chats_loaded: boolean = false

  constructor(public firebaseService: FirebaseService) {
    this.firebaseService.getUser().subscribe((user: User | null) => {
      this.onUserChanged(user)
    })
  }

  public getChats(): Observable<Chat[]> {
    return of(this.chats)
  }

  public getChat(id: string): Observable<Chat> {
    return of(this.chats.filter((chat: Chat) => chat.id === id)[0]);
  }

  private getChatIndex(id: string): number {
    for (let i = 0; i < this.chats.length; i++) {
      if (this.chats[i].id == id)
        return i
    }
    console.error(`Chat with id \"${id}\" not found`)
    return 0
  }

  private getMessageIndex(chat: Chat, id: string): number {
    for (let i = 0; i < chat.messages.length; i++) {
      if (chat.messages[i].id == id)
        return i
    }
    console.error(`Message with id \"${id}\" not found`)
    return 0
  }

  private haveChat(id: string): boolean {
    return this.chats.filter((chat: Chat) => chat.id === id).length > 0
  }

  private clearChats() {
    while (this.chats.length) {
      this.chats.pop()
    }
  }

  private onUserChanged(user: User | null) {
    this.remote_chats_loaded = false
    this.clearChats()
    if (user) {
      console.log("User changed:" + user?.uid)
      this.firebaseService.onChats().subscribe((value) => {
        let chats: Chat[] = []
        value.snapshot.forEach((child) => {
          chats.push({
            id: child.child('id').val(),
            name: child.child('name').val(),
            messages: [],
            remote_last: 0,
            sync: true,
            ctime: child.child('ctime').val(),
            utime: child.child('utime').val()
          })
          this.onRemoteChats(chats)
        })
        this.remote_chats_loaded = true
      })
      this.firebaseService.onEvents().subscribe((ev) => {
        ev.snapshot.forEach((chat_child) => {
          chat_child.forEach((event_child) => {
            const index: number = Number(event_child.key)
            const event_list = event_child.val()
            this.getChat(chat_child.key).subscribe((chat: Chat) => {
              if (chat && chat.remote_last < index) {
                chat.remote_last = index
                this.onRemoteEvent(chat, event_list[0], event_list[1])
              }
            })
          })
        })
      })
    }
  }

  private onRemoteChats(chats: Chat[]) {
    chats.forEach((chat) => {
      if (!this.haveChat(chat.id))
        this.chats.push(chat)
    })
  }

  private onRemoteEvent(chat: Chat, type: string, data: string) {
    if (type == 'add') {
      let message: Message = {
        id: data,
        chat_id: chat.id,
        role: 'user',
        content: "",
        ctime: 0,
      }
      chat.messages.push(message)
      this.firebaseService.loadMessage(chat.id, data).then((snapshot) => {
        message.role = snapshot.child('role').val()
        message.content = snapshot.child('content').val()
        message.ctime = snapshot.child('ctime').val()
      })
    } else if (type == 'delete') {
      chat.messages.splice(this.getMessageIndex(chat, data), 1)
    }
  }

  public chatLastMessageContent(chat_id: string): string {
    const chat: Chat = this.chats[this.getChatIndex(chat_id)]
    if (chat.messages.length)
      return chat.messages[chat.messages.length - 1].content
    return ""
  }

  public newChat() {
    const date = new Date();
    this.chats.push({
      id: uuid4(),
      name: "New chat",
      messages: [],
      remote_last: 0,
      sync: false,
      ctime: date.getUTCSeconds(),
      utime: date.getUTCSeconds(),
    })
  }

  public removeChat(chat_id: string) {
    const chat: Chat = this.chats.filter((chat: Chat) => chat.id === chat_id)[0]
    if (chat.sync)
      this.firebaseService.removeChat(chat_id)
    const index = this.getChatIndex(chat_id)
    if (index > -1) {
      this.chats.splice(index, 1);
    }
  }

  public newMessage(chat_id: string, role: string, content: string) {
    const date = new Date();
    let chat: Chat = this.chats.filter((chat: Chat) => chat.id === chat_id)[0]
    let message: Message = {
      id: uuid4(),
      chat_id: chat_id,
      role: role,
      content: content,
      ctime: date.getUTCSeconds(),
    }
    chat.utime = date.getUTCSeconds()
    chat.messages.push(message)
    if (chat.sync) {
      this.firebaseService.addMessage(chat, message)
    }
  }

  public removeMessage(chat_id: string, id: string) {
    let chat: Chat = this.chats.filter((chat: Chat) => chat.id === chat_id)[0]
    chat.messages.splice(this.getMessageIndex(chat, id), 1)
    if (chat.sync) {
      this.firebaseService.removeMessage(chat, id)
    }
  }

  public updateChat(chat: Chat, sync: boolean) {
    if (sync == chat.sync) {
      if (sync)
        this.firebaseService.updateChat(chat)
      return
    }
    chat.sync = sync
    if (sync)
      this.firebaseService.pushChat(chat)
    else
      this.firebaseService.removeChat(chat.id)
  }
}
