import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {IonActionSheet} from "@ionic/angular";
import {Share} from "@capacitor/share";
import {Clipboard} from '@capacitor/clipboard';
import {Message} from "../../core/models/message";
import {ChatsService} from "../../core/services/chats.service";
import {Reply} from "../../core/models/reply";
import {Haptics, ImpactStyle} from "@capacitor/haptics";

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

  @Input() message?: Message;
  @Output() replyClicked = new EventEmitter();
  private holdTimeout: any;

  protected reply: Reply[] = [];

  constructor(private readonly chatsService: ChatsService) {
  }

  ngOnInit() {
    this.reply = this.message?.reply.filter(r => r.type == 'explicit') ?? [];
  }

  public onContextMenu() {
    void this.action_sheet?.present()
    void Haptics.impact({ style: ImpactStyle.Medium });
  }

  protected getMessage(id: string): Message | null {
    if (this.message)
      return this.chatsService.getMessage(this.message?.chat_uuid, id) ?? null;
    return null;
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
