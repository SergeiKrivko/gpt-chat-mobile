import {Component, inject, OnInit} from '@angular/core';
import {SocketService} from "../../core/services/socket.service";
import {ChatsService} from "../../core/services/chats.service";
import {AuthService} from "../../core/services/auth.service";
import {map} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  private readonly authService = inject(AuthService);

  constructor(private readonly socketService: SocketService,
              private readonly chatsService: ChatsService) {
  }

  protected readonly chats$ = this.chatsService.chats$.pipe(
    map(chats => chats.filter(chat => !chat.archived))
  );

  ngOnInit() {
    this.socketService.init().pipe(
      // takeUntilDestroyed()
    ).subscribe();
    this.chatsService.init().pipe(
      // takeUntilDestroyed()
    ).subscribe();
    this.authService.init().pipe(
      // takeUntilDestroyed()
    ).subscribe();
  }

  public addChat() {
    this.chatsService.newChat();
  }
}
