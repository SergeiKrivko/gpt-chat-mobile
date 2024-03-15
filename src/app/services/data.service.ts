import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import { UUID } from "angular2-uuid"

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
}

export interface Message {
  role: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public chats: Chat[] = [
    {
      id: "123-456",
      name: "Chat",
      messages: [{role: "user", content: "Test message"}]
    },

    {
      id: "123-456-7",
      name: "Chat 2",
      messages: [{role: "user", content: "Test message"}]
    }
  ]

  constructor() { }

  public getChats(): Observable<Chat[]> {
    return of(this.chats);
  }

  public getChat(id: string): Observable<Chat> {
    return of(this.chats.filter((chat: Chat) => chat.id === id)[0]);
  }

  public newChat() {
    this.chats.push({
      id: UUID.UUID(),
      name: "New chat",
      messages: []
    })
  }

  public newMessage(chat_id: string, role: string, content: string) {
    this.chats.filter((chat: Chat) => chat.id === chat_id)[0].messages.push({
      role: role,
      content: content
    })
  }
}
