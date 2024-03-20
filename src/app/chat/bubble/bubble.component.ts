import {Component, Input, ViewChild} from '@angular/core';
import {DataService, Message} from "../../services/data.service";
import {IonActionSheet, IonContent} from "@ionic/angular";
import {Share} from "@capacitor/share";
import {Clipboard} from '@capacitor/clipboard';

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss'],
})
export class BubbleComponent {

  // @ts-ignore
  @ViewChild(IonActionSheet) action_sheet: IonActionSheet;

  public actionSheetButtons = [
    {
      text: 'Reply',
      icon: 'arrow-undo-outline',
      data: {
        action: 'reply',
      },
    },
    {
      text: 'Copy as text',
      icon: 'copy-outline',
      data: {
        action: 'copy',
      },
    },
    {
      text: 'Copy as Markdown',
      icon: 'logo-markdown',
      data: {
        action: 'copy-md',
      },
    },
    {
      text: 'Share',
      icon: 'share-outline',
      data: {
        action: 'share',
      },
    },
    {
      text: 'Delete',
      icon: 'trash-outline',
      role: 'destructive',
      data: {
        action: 'delete',
      },
    },
    {
      text: 'Cancel',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  constructor() {
  }

  @Input() message?: Message;
  @Input() chatService?: DataService;

  public onContextMenu() {
    this.action_sheet.present()
  }

  public onActionSheetDismiss(event: any) {
    if (this.chatService && this.message && event.detail.data)
      switch (event.detail.data.action) {
        case "reply":
          console.log('reply')
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
          this.chatService.deleteMessage(this.message.chat_id, this.message.id)
          break
      }
  }

  private async share(text: string) {
    await Share.share({
      text: text,
    });
  }

  private async writeToClipboard(text: string) {
    await Clipboard.write({
      string: text
    });
  }


}
