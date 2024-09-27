import {Component, inject, Input} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {RouterLink} from "@angular/router";
import {NgIf} from "@angular/common";
import {Chat} from "../../core/models/chat";
import {ChatsService} from "../../core/services/chats.service";

@Component({
  selector: 'app-chat-item',
  standalone: true,
  imports: [
    IonicModule,
    RouterLink,
    NgIf
  ],
  templateUrl: './chat-item.component.html',
  styleUrl: './chat-item.component.scss'
})
export class ChatItemComponent {
  @Input() chat?: Chat

  private readonly chatsService = inject(ChatsService);

  public chatLink(): string {
    return this.chat ? `/chat/${this.chat.uuid}` : ''
  }

  deleteChat() {
    if (this.chat) {
      this.chatsService.deleteChat(this.chat?.uuid)
    }
  }

  moveToArchive() {
    if (this.chat) {
      this.chatsService.updateChat(this.chat.uuid, {
        archived: true,
      })
    }
  }

  moveFromArchive() {
    if (this.chat) {
      this.chatsService.updateChat(this.chat.uuid, {
        archived: false,
      })
    }
  }
}
