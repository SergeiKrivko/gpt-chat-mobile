import {Component, Input} from '@angular/core';
import {Message} from "../../services/data.service";

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss'],
})
export class BubbleComponent   {

  constructor() { }
  @Input() message?: Message;

}
