import {Component, Input, OnInit} from '@angular/core';
import {Chat, DataService, Message} from "../../services/data.service";
import {HttpClient} from '@angular/common/http';
import {IonTextarea} from "@ionic/angular";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {catchError, of, switchMap} from "rxjs";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  chat?: Chat;

  private url: string = "https://www.llama2.ai/api";

  constructor(private http: HttpClient,
              private route: ActivatedRoute,
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

  getMessages(): Message[] {
    return this.chat ? this.chat.messages : [];
  }

  sendMessage(textarea: IonTextarea) {
    if (this.chat && textarea.value) {
      this.chatService.newMessage(this.chat.id, 'user', textarea.value as string)
      this.runGPT(textarea.value);
      textarea.value = "";
    }
  }

  runGPT(text: string | null | undefined) {
    this.http.post(this.url,
      {
        "prompt": text,
        "model": "meta/llama-2-70b-chat",
        "maxTokens": 8000,
      }, {
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        responseType: "text"
      }).subscribe(
      (data: any) => {
        console.log(data)
        if (this.chat) {
          this.chatService.newMessage(this.chat.id, 'assistant', data as string)
        }
      }
    );
  }
}
