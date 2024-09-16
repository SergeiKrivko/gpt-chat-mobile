import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {tap} from "rxjs";
import {SignInResponse} from "../models/sign_in_resp";
import {SocketService} from "./socket.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly firebaseApiKey = "AIzaSyA8z4fe_VedzuLvLQk9HnQTFnVeJDRdxkc";

  userEmail: string | null = null;
  idToken: string | null = null;
  refreshToken: string | null = null;

  private readonly socketService = inject(SocketService);

  signInWithPassword(login: string, password: string) {
    return this.http.post<SignInResponse>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.firebaseApiKey}`,
      {
        email: login,
        password: password,
        returnSecureToken: true,
      }).pipe(tap(resp => {
      this.setUser(resp.email, resp.idToken, resp.refreshToken);
    }));
  }

  private setUser(email: string | null, idToken: string | null, refreshToken: string | null) {
    this.userEmail = email;
    this.idToken = idToken;
    this.refreshToken = refreshToken;

    this.socketService.disconnect()
    if (idToken)
      this.socketService.connect(this.idToken)
  }

  signOut() {
    this.setUser(null, null, null)
  }
}
