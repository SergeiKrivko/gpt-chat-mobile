import {Component, inject, Input, OnInit} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {RouterLink} from "@angular/router";
import {NgIf} from "@angular/common";
import {Chat} from "../../core/models/chat";
import {ChatsService} from "../../core/services/chats.service";
import {map, tap} from "rxjs";
import {Message} from "../../core/models/message";

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
export class ChatItemComponent implements OnInit {
  @Input() chat?: Chat

  private readonly chatsService = inject(ChatsService);
  protected lastMessage: Message | null = null;

  ngOnInit() {
    if (this.chat) {
      this.chatsService.getMessages(this.chat.uuid).pipe(
        map(messages => messages.length ? messages[0] : null),
        tap(m => this.lastMessage = m)
      ).subscribe()
    }
  }

  public chatLink(): string {
    return this.chat ? `/chat/${this.chat.uuid}` : ''
  }

  deleteChat() {
    if (this.chat) {
      this.chatsService.deleteChat(this.chat?.uuid)
    }
  }

  pinChat() {
    if (this.chat) {
      this.chatsService.updateChatImmediately(this.chat.uuid, {
        pinned: true,
      })
    }
  }

  unpinChat() {
    if (this.chat) {
      this.chatsService.updateChatImmediately(this.chat.uuid, {
        pinned: false,
      })
    }
  }

  moveToArchive() {
    if (this.chat) {
      this.chatsService.updateChatImmediately(this.chat.uuid, {
        archived: true,
      })
    }
  }

  moveFromArchive() {
    if (this.chat) {
      this.chatsService.updateChatImmediately(this.chat.uuid, {
        archived: false,
      })
    }
  }

  generateCircleText() {
    if (!this.chat)
      return "";
    let lst: string[] = [];
    this.chat.name.split(' ').forEach(word => {
      if (word) {
        lst.push(word[0]);
        for (let i = 1; i < word.length; i++) {
          if (word[i] == word[i].toUpperCase())
            lst.push(word[i]);
        }
      }
    });
    if (lst.length > 2) {
      lst = lst.slice(0, 2);
    }
    return lst.join('');
  }
}
