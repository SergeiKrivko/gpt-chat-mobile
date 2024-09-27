import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ReplyCreate} from "../../core/models/reply_create";

@Component({
  selector: 'app-reply-item',
  templateUrl: './reply-item.component.html',
  styleUrls: ['./reply-item.component.scss'],
})
export class ReplyItemComponent {

  constructor() { }

  @Input() text: string = "";
  @Input() removable: boolean = false;
  @Output() deleted = new EventEmitter<void>();

}
