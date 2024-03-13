import { Injectable } from '@angular/core';

export interface Message {
  id: number;
  role: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public messages: Message[] = [
    {
      id: 1,
      role: 'user',
      content: 'Hello!'
    },
    {
      id: 2,
      role: 'assistant',
      content: 'Hello!'
    },
  ];

  constructor() { }

  public getMessages(): Message[] {
    return this.messages;
  }

  public getMessageById(id: number): Message {
    return this.messages[id];
  }
}
