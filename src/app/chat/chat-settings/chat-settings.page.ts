import {Component, OnInit} from '@angular/core';
import {Chat, DataService} from "../../services/data.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {catchError, of, switchMap} from "rxjs";

@Component({
  selector: 'app-chat-settings',
  templateUrl: './chat-settings.page.html',
  styleUrls: ['./chat-settings.page.scss'],
})
export class ChatSettingsPage implements OnInit {
  chat?: Chat;

  constructor(private route: ActivatedRoute,
              private chatService: DataService) {
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const id: string | null = params.get('id');
          if (id)
            return this.chatService.getChat(id);
          throw new Error('Необходимо передать ID проекта');
        }),
        catchError((error: Error) => {
          return of(false);
        })
      )
      .subscribe((chat: Chat | boolean): void => {
        if (typeof chat != 'boolean') {
          this.chat = chat;
        }
      })
  }

}
