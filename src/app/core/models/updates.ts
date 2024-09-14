import {Chat} from "./chat";
import {Message} from "./message";

export interface Updates {
  new_chats: Chat[];
  deleted_chats: Chat[];
  updated_chats: Chat[];
  new_messages: Message[];
  deleted_messages: Message[];
}
