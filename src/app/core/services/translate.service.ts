import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {
  map, Observable,
} from "rxjs";
import {HttpResp} from "../models/socket_resp";
import {DetectResponse, TranslateResponse} from "../models/translate_resp";

@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  private readonly http = inject(HttpClient);

  detect(text: string): Observable<string> {
    return this.http.post<HttpResp<DetectResponse>>("https://gptchat-api.nachert.art/api/v1/translate/detect",
      {
        text: text,
      }).pipe(
      map(resp => resp.data.lang)
    );
  }

  translate(text: string, dst: string): Observable<TranslateResponse> {
    return this.http.post<HttpResp<TranslateResponse>>(`https://gptchat-api.nachert.art/api/v1/translate/translate?dst=${dst}`,
      {
        text: text,
      }).pipe(
      map(resp => resp.data)
    );
  }
}
