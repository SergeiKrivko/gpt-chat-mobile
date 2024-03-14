import {Component, OnInit} from '@angular/core';
import {Message} from "../../services/data.service";
import {HttpClient} from '@angular/common/http';
import {IonTextarea} from "@ionic/angular";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage {
  public messages: Message[] = [
    {
      role: 'user',
      content: 'Hello!'
    },
    {
      role: 'assistant',
      content: 'Hello!'
    },
  ];
  private url: string = "/api";

  constructor(private http: HttpClient) {
  }

  getMessages(): Message[] {
    return this.messages;
  }

  sendMessage(textarea: IonTextarea) {
    this.messages.push(<Message>{
      role: 'user',
      content: textarea.value
    })
    this.runGPT(textarea.value);
    textarea.value = "";
  }

  runGPT(text: string | null | undefined) {
    this.http.post(this.url,
      {
        "prompt": text,
        "model": "meta/llama-2-70b-chat",
        "maxTokens": 8000,
      }, {
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        responseType: "text"
      }).subscribe(
      (data: any) => {
        console.log(data)
        this.messages.push({
          role: 'assistant',
          content: data as string
        })
      }
    );
  }

}
