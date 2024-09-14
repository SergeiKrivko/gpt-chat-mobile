import {Component, Input} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {RouterLink} from "@angular/router";
import {NgIf} from "@angular/common";
import {Chat} from "../../core/models/chat";

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

  public chatLink(): string {
    return this.chat ? `/chat/${this.chat.uuid}` : ''
  }
}
