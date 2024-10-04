import {Component, inject, ViewChild} from '@angular/core';
import {IonContent, IonToast, ScrollDetail} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {Chat} from "../../core/models/chat";
import {ChatsService} from "../../core/services/chats.service";
import {EMPTY, filter, from, map, Observable, of, switchMap, tap} from "rxjs";
import {Message} from "../../core/models/message";
import {ReplyCreate} from "../../core/models/reply_create";
import {Camera, CameraResultType, Photo} from '@capacitor/camera';
import {TranslateService} from "../../core/services/translate.service";
import {OcrModalComponent} from "../../shared/ocr-modal/ocr-modal.component";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage {
  chat?: Chat;
  protected readonly messages$: Observable<Message[]>;
  protected readonly gptWriting$: Observable<boolean>;
  text: string = "";
  reply: ReplyCreate[] = [];

  @ViewChild(IonContent) private readonly content: IonContent | undefined;

  @ViewChild(IonToast) private readonly toast: IonToast | undefined;

  @ViewChild(OcrModalComponent) private readonly ocrModal: OcrModalComponent | undefined;

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
    this.gptWriting$ = this.chatsService.getGptWriting(id ?? "");
    this.chatsService.gptError$.pipe(
      tap(this.showToast)
    ).subscribe();
  }

  public toastButtons = [
    {
      text: 'Dismiss',
      role: 'cancel',
    },
  ];

  sendMessage() {
    if (this.chat && this.text) {
      this.chatsService.newMessage(this.chat.uuid, this.text, this.reply)
      this.text = "";
    }
    this.reply = [];
  }

  sendFromImage(text: string) {
    if (this.chat)
      this.chatsService.newMessage(this.chat.uuid, text)
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

  onReplyClicked(id: string) {
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

  getMessage(id: string): Message | null {
    return this.chatsService.getMessage(id) ?? null;
  }

  onImageClicked() {
    this.ocrModal?.open();
  }
}
