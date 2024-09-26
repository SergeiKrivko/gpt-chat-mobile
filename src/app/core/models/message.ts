import {Reply} from "./reply";

export interface Message {
  uuid: string;
  chat_uuid: string;
  created_at: string;
  deleted_at: string;
  role: string;
  content: string;
  reply: Reply[];
}
