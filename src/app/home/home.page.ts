import {Component, OnInit} from '@angular/core';
import {Chat, DataService} from "../services/data.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public chats: Chat[] = []

  constructor(private data: DataService) {
  }

  ngOnInit() {
    this.data.getChats().subscribe((chats: Chat[]) => {
      this.chats = chats
    })
  }

  public addChat() {
    this.data.newChat()
  }
}
