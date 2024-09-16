import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {SocketService} from "../../core/services/socket.service";
import {Chat} from "../../core/models/chat";
import {ChatsService} from "../../core/services/chats.service";
import {AuthService} from "../../core/services/auth.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  public chats: Chat[] = [];

  constructor(private router: Router,
              private readonly authService: AuthService,
              private readonly socketService: SocketService,
              private readonly chatsService: ChatsService) {
  }

  ngOnInit() {
    // this.socketService.init().subscribe();

    if (!this.authService.userEmail)
      void this.router.navigate(['/auth']);

    // this.authService.userChanged$.subscribe(user => {
    //   if (user == null) {
    //     void this.router.navigate(['/auth']);
    //   }
    // })
    //
    // if (!this.authService.getUser() || !this.authService.getUser()?.email) {
    //   void this.router.navigate(['/auth']);
    // }

    this.chatsService.newChats$.subscribe();
    this.chatsService.deleteChats$.subscribe();
    this.chatsService.newMessages$.subscribe();
    this.chatsService.messageAddContent$.subscribe();
    this.chatsService.updates$.subscribe();
    this.chatsService.getChats().subscribe(chats => this.chats = chats);
  }

  public addChat() {
  }
}
