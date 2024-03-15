import {Component, Input} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {RouterLink} from "@angular/router";
import {Chat} from "../services/data.service";

@Component({
  selector: 'app-chat-item',
  standalone: true,
  imports: [
    IonicModule,
    RouterLink
  ],
  templateUrl: './chat-item.component.html',
  styleUrl: './chat-item.component.css'
})
export class ChatItemComponent {
  @Input() chat?: Chat

  public chatLink(): string {
    return this.chat ? `/chat/${this.chat.id}` : ''
  }
}
