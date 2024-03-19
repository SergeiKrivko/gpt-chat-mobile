import {Component, Input} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {RouterLink} from "@angular/router";
import {Chat, DataService} from "../services/data.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-chat-item',
  standalone: true,
  imports: [
    IonicModule,
    RouterLink,
    NgIf
  ],
  templateUrl: './chat-item.component.html',
  styleUrl: './chat-item.component.css'
})
export class ChatItemComponent {
  @Input() chat?: Chat
  @Input() chatService?: DataService

  public chatLink(): string {
    return this.chat ? `/chat/${this.chat.id}` : ''
  }
}
