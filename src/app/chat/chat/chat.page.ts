import {Component, OnInit} from '@angular/core';
import {Message} from "../../services/data.service";
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {IonTextarea} from "@ionic/angular";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
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
  private url: string = "https://www.llama2.ai";

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
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
    this.http.post(this.url + "/api",
      {
        "prompt": text,
        "model": "meta/llama-2-70b-chat",
        "maxTokens": 8000,
      }, {
        headers: {
          "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0",
          "Accept": "*/*",
          "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
          "Accept-Encoding": "gzip, deflate, br",
          "Referer": this.url,
          "Content-Type": "text/plain;charset=UTF-8",
          "Origin": this.url,
          "Connection": "keep-alive",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
          "TE": "trailers"
        }
      }).subscribe(
      (data: any) => this.messages.push(<Message>{
        role: 'assistant',
        content: data
      })
    );
  }

}
