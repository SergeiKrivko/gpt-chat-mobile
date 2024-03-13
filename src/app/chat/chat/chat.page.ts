import {Component, inject, OnInit} from '@angular/core';
import {DataService, Message} from "../../services/data.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  private data = inject(DataService);

  constructor() {
  }

  ngOnInit() {
  }

  getMessages(): Message[] {
    return this.data.getMessages();
  }

  runGPT(): string {
    return "Hello!"
  }

}
