import {Component, inject} from '@angular/core';
import {ChatsService} from "../../core/services/chats.service";
import {map} from "rxjs";

@Component({
  selector: 'app-archive',
  templateUrl: './archive-page.component.html',
  styleUrls: ['./archive-page.component.scss'],
})
export class ArchivePageComponent {

  private readonly chatsService = inject(ChatsService);

  protected readonly chats$ = this.chatsService.chats$.pipe(
    map(chats => chats.filter(chat => chat.archived))
  );

  public addChat() {
    this.chatsService.newChat();
  }
}
