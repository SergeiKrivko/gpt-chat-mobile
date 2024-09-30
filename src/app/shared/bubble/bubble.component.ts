import {ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {IonActionSheet} from "@ionic/angular";
import {Share} from "@capacitor/share";
import {Clipboard} from '@capacitor/clipboard';
import {Message} from "../../core/models/message";
import {ChatsService} from "../../core/services/chats.service";
import {Reply} from "../../core/models/reply";
import {Haptics, ImpactStyle} from "@capacitor/haptics";
import {map, Observable, tap} from "rxjs";
import {MarkdownComponent} from "ngx-markdown";
import {TranslateService} from "../../core/services/translate.service";

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss'],
})
export class BubbleComponent implements OnInit {

  @ViewChild('actionSheet') actionSheet: IonActionSheet | undefined;
  @ViewChild('translateSheet') translateSheet: IonActionSheet | undefined;
  protected currentLang: string | undefined;
  protected originalLang: string | undefined;

  readonly actionSheetButtons = [
    {
      text: 'Ответить',
      icon: 'arrow-undo-outline',
      data: {
        action: 'reply',
      },
    },
    {
      text: 'Копировать как текст',
      icon: 'copy-outline',
      data: {
        action: 'copy',
      },
    },
    {
      text: 'Копировать как Markdown',
      icon: 'logo-markdown',
      data: {
        action: 'copy-md',
      },
    },
    {
      text: 'Поделиться',
      icon: 'share-outline',
      data: {
        action: 'share',
      },
    },
    {
      text: 'Перевести',
      icon: 'language-outline',
      data: {
        action: 'translate',
      },
    },
    {
      text: 'Удалить',
      icon: 'trash-outline',
      role: 'destructive',
      data: {
        action: 'delete',
      },
    },
    {
      text: 'Отмена',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  @Input() messageId?: string;
  @Output() replyClicked = new EventEmitter();
  private holdTimeout: any;
  protected message: Message | undefined;

  @ViewChild('markdownComponent') markdownComponent: MarkdownComponent | undefined;

  protected reply: Reply[] = [];
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translateService = inject(TranslateService);

  constructor(private readonly chatsService: ChatsService) {
  }

  private message$: Observable<Message | undefined> = this.chatsService.allMessages$.pipe(
    map(messages => messages.get(this.messageId ?? '')),
    tap(m => {
      this.message = m;
      this.reply = this.message?.reply.filter(r => r.type == 'explicit') ?? [];
      this.markdownComponent?.render(this.message?.content ?? "")
      this.cdr.detectChanges();
    })
  );

  ngOnInit() {
    this.message$.subscribe();
  }

  public onContextMenu() {
    void this.actionSheet?.present()
    void Haptics.impact({style: ImpactStyle.Medium});
  }

  protected getMessage(id: string): Message | null {
    return this.chatsService.getMessage(id) ?? null;
  }

  public onActionSheetDismiss(event: any) {
    if (this.message && event.detail.data)
      switch (event.detail.data.action) {
        case "reply":
          this.replyClicked.emit();
          break
        case "copy":
          this.writeToClipboard(this.message.content)
          break
        case "copy-md":
          this.writeToClipboard(this.message.content)
          break
        case "share":
          this.share(this.message.content)
          break
        case "translate":
          this.translateSheet?.present();
          break
        case "delete":
          this.chatsService.deleteMessage(this.message.uuid)
          break
      }
  }

  public onTranslateSheetDismiss(event: any) {
    if (this.message && event.detail.data)
      if (event.detail.data.action === '') {
        this.markdownComponent?.render(this.message?.content ?? "")
        this.currentLang = this.originalLang;
        this.cdr.detectChanges();
      }
      else if (event.detail.data.action) {
        this.translateService.translate(this.message.content, event.detail.data.action).subscribe(resp => {
          this.markdownComponent?.render(resp.res);
          this.currentLang = resp.dst;
          if (!this.originalLang)
            this.originalLang = resp.src;
          this.cdr.detectChanges();
        })
      }
  }

  stringEscapeBackslashes(s: string): string {
    return s ? s.replace(/\\/g, '\\\\') : s;
  }

  private share(text: string) {
    void Share.share({
      text: text,
    });
  }

  private writeToClipboard(text: string) {
    void Clipboard.write({
      string: text
    });
  }

  onTouchStart() {
    this.holdTimeout = setTimeout(() => this.onContextMenu(), 500);
  }

  onTouchEnd() {
    clearTimeout(this.holdTimeout);
  }

  translateActions() {
    const res = [];
    if (this.currentLang !== this.originalLang) {
      res.push({
        text: 'Показать оригинал',
        data: {
          action: '',
        },
        role: 'cancel'
      });
    }
    [
      {code: 'rus', name: 'Русский'},
      {code: 'eng', name: 'Английский'},
      {code: 'fra', name: 'Французский'},
      {code: 'ger', name: 'Немецкий'},
      {code: 'ita', name: 'Итальянский'},
      {code: 'esp', name: 'Испанский'},
    ].forEach(el => {
      if (this.currentLang !== el.code)
        res.push({
          text: el.name,
          data: {
            action: el.code,
          }
        });
    });
    return res;
  }
}
