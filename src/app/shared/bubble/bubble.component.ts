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

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss'],
})
export class BubbleComponent implements OnInit {

  @ViewChild(IonActionSheet) action_sheet: IonActionSheet | undefined;

  public actionSheetButtons = [
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
    void this.action_sheet?.present()
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
        case "delete":
          this.chatsService.deleteMessage(this.message.uuid)
          break
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

  protected readonly ChatsService = ChatsService;
}
