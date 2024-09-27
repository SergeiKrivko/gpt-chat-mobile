import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {IonContent, IonToast, ScrollDetail} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {Chat} from "../../core/models/chat";
import {ChatsService} from "../../core/services/chats.service";
import {Observable} from "rxjs";
import {Message} from "../../core/models/message";
import {Reply} from "../../core/models/reply";
import {ReplyCreate} from "../../core/models/reply_create";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  chat?: Chat;
  protected readonly messages$: Observable<Message[]>;
  text: string = "";
  reply: ReplyCreate[] = [];

  @ViewChild(IonContent) private readonly content: IonContent | undefined;

  @ViewChild(IonToast) private readonly toast: IonToast | undefined;

  public scroll_top: number = 0
  public scroll_bottom: number = 200
  public searchbar_hidden: boolean = true

  private readonly router = inject(Router);

  constructor(private readonly chatsService: ChatsService,
              private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chatsService.getChat(id).subscribe(chat => {
        if (chat) {
          this.chat = chat
        } else {
          void this.router.navigateByUrl('/home');
        }
      });
    }
    this.messages$ = this.chatsService.getMessages(id ?? "");
  }

  public toastButtons = [
    {
      text: 'Dismiss',
      role: 'cancel',
    },
  ];

  ngOnInit() {
    // const id = this.route.snapshot.paramMap.get('id');
    // if (id) {
    //   this.chatsService.getChat(id).subscribe(chat => {
    //     if (chat) {
    //       this.chat = chat
    //     }
    //   });
    // }
  }

  sendMessage() {
    if (this.chat && this.text) {
      this.chatsService.newMessage(this.chat.uuid, this.text, this.reply)
      this.text = "";
    }
    this.reply = [];
  }

  public scrollToBottom() {
    // Passing a duration to the method makes it so the scroll slowly
    // goes to the bottom instead of instantly
    this.content?.scrollToBottom(500);
  }

  private showToast(error: string) {
    if (this.toast) {
      this.toast.message = error
      void this.toast.present()
    }
  }

  public onScroll(ev: CustomEvent<ScrollDetail>) {
    this.content?.getScrollElement().then((elem) => {
      this.scroll_top = ev.detail.scrollTop
      this.scroll_bottom = (elem.scrollHeight - ev.detail.scrollTop - elem.offsetHeight)
    })
  }

  onReplyClicked(id: string){
    if (this.reply.filter(r => r.reply_to == id).length)
      return;
    this.reply.push({
      reply_to: id,
      type: 'explicit',
    });
  }

  removeReply(id: string) {
    this.reply = this.reply.filter(r => r.reply_to !== id);
  }

  public showSearchbar() {
    this.searchbar_hidden = !this.searchbar_hidden
  }
}
