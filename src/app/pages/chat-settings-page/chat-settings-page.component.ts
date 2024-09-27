import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Chat} from "../../core/models/chat";
import {ChatsService} from "../../core/services/chats.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {min} from "rxjs";

@Component({
  selector: 'app-chat-settings-page',
  templateUrl: './chat-settings-page.component.html',
  styleUrls: ['./chat-settings-page.component.scss'],
})
export class ChatSettingsPageComponent {

  protected chat: Chat | null = null;

  private readonly chatsService = inject(ChatsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly formGroup = new FormGroup({
    name: new FormControl(''),
    model: new FormControl(''),
    context: new FormControl(0, [Validators.min(0), Validators.max(20)]),
    temperature: new FormControl(0, [Validators.min(0), Validators.max(1)]),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chatsService.getChat(id).subscribe(chat => {
        if (chat) {
          this.chat = chat
          this.formGroup.setValue({
            name: chat.name,
            model: chat.model,
            context: chat.context_size,
            temperature: chat.temperature,
          })
        } else {
          void this.router.navigateByUrl('/home');
        }
      });
    }
  }
}
