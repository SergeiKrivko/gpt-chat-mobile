import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Chat, DataService, Message} from "../../services/data.service";
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {IonContent, IonTextarea, IonToast} from "@ionic/angular";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {catchError, Observable, of, switchMap, throwError} from "rxjs";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  chat?: Chat;

  // @ts-ignore
  @ViewChild(IonContent) content: IonContent;
  // @ts-ignore
  @ViewChild(IonToast) toast: IonToast;

  private url: string = "/api";

  constructor(private http: HttpClient,
              private route: ActivatedRoute,
              public chatService: DataService) {
  }

  public toastButtons = [
    {
      text: 'Dismiss',
      role: 'cancel',
    },
  ];

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
      }).pipe(catchError((error: Error) => {
      console.warn(error)
      this.showToast(error.message as string)
      return of(false)
    })).subscribe(
      (data: any) => {
        console.log(data)
        if (this.chat) {
          this.chatService.newMessage(this.chat.id, 'assistant', data as string)
        }
      }
    );
  }

  public scrollToBottom() {
    // Passing a duration to the method makes it so the scroll slowly
    // goes to the bottom instead of instantly
    this.content.scrollToBottom(500);
  }

  private showToast(error: string) {
    this.toast.message = error
    this.toast.present()
  }
}
