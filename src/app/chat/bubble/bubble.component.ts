import {Component, Input} from '@angular/core';
import {DataService, Message} from "../../services/data.service";

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss'],
})
export class BubbleComponent   {


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

  constructor() { }
  @Input() message?: Message;
  @Input() chatService?: DataService;

}
