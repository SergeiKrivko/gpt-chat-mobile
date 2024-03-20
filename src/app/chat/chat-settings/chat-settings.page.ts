import {Component, OnInit, ViewChild} from '@angular/core';
import {Chat, DataService} from "../../services/data.service";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {catchError, of, switchMap} from "rxjs";
import {IonInput, IonToggle} from "@ionic/angular";

@Component({
  selector: 'app-chat-settings',
  templateUrl: './chat-settings.page.html',
  styleUrls: ['./chat-settings.page.scss'],
})
export class ChatSettingsPage implements OnInit {
  chat?: Chat;

  // @ts-ignore
  @ViewChild('name_input') name_input: IonInput;
  // @ts-ignore
  @ViewChild('um_input') um_input: IonInput;
  // @ts-ignore
  @ViewChild('sm_input') sm_input: IonInput;
  // @ts-ignore
  @ViewChild('t_input') t_input: IonInput;
  // @ts-ignore
  @ViewChild('sync_toggle') sync_toggle: IonToggle;

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

  public onClose() {
    if (this.chat) {
      this.chat.name = this.name_input.value as string
      this.chatService.updateChat(this.chat, this.sync_toggle.checked)
    }
  }
}
