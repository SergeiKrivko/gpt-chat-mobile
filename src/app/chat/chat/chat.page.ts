import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Chat, DataService, Message} from "../../services/data.service";
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {IonContent, IonTextarea, IonFabButton, IonToast, ScrollDetail} from "@ionic/angular";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {catchError, from, of, switchMap, throwError} from "rxjs";
import {CapacitorHttp} from "@capacitor/core";

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
  // @ts-ignore
  @ViewChild('button_down') button_down: IonFabButton;

  private url: string = "/api"
  // private url: string = "/llama"
  // private url: string = "https://www.llama2.ai/api"

  public scroll_top: number = 0
  public scroll_bottom: number = 200
  public searchbar_hidden: boolean = true

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

  public async runGPT(text: string | null | undefined) {
    // this.http.post(this.url,
    //   {
    //     "prompt": text,
    //     "model": "meta/llama-2-70b-chat",
    //     "maxTokens": 8000,
    //     }, {
    //     headers: {
    //       "Content-Type": "text/plain;charset=UTF-8",
    //     },
    //     responseType: "text"
    //   }).pipe(catchError((error: Error) => {
    //       console.warn(error)
    //       this.showToast(error.message as string)
    //       return of(false)
    //     })).subscribe(
    //       (data: any) => {
    //         console.log(data)
    //         if (this.chat) {
    //           this.chatService.newMessage(this.chat.id, 'assistant', data as string)
    //         }
    //       }
    //     );

    let res = await CapacitorHttp.get({
      url: '/test'
    })
    console.log(res.data)

    let resp = await CapacitorHttp.post({
      url: this.url,
      headers: {
        "Content-Type": "text/plain;charset=UTF-8",
      },
      data: {
        "prompt": text,
        "model": "meta/llama-2-70b-chat",
        "maxTokens": 8000,
      }
    })
    if (resp.status == 200) {
      console.log(resp.data)
      if (this.chat) {
        this.chatService.newMessage(this.chat.id, 'assistant', resp.data as string)
      }
    } else {
      console.warn(resp.data)
      this.showToast(resp.data as string)
    }
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

  public onScroll(ev: CustomEvent<ScrollDetail>) {
    this.content.getScrollElement().then((elem) => {
      this.scroll_top = ev.detail.scrollTop
      this.scroll_bottom = (elem.scrollHeight - ev.detail.scrollTop - elem.offsetHeight)
    })
  }

  public showSearchbar() {
    this.searchbar_hidden = !this.searchbar_hidden
  }
}
