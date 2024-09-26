import {inject, Injectable} from '@angular/core';
import {Socket} from "ngx-socket-io";
import {EMPTY, map, merge, switchMap, tap} from "rxjs";
import {SocketResp} from "../models/socket_resp";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private readonly socket: Socket = inject(Socket)
  private readonly authService = inject(AuthService);

  private connected: boolean = false;

  init() {
    const pipe2 = this.authService.userChanged$.pipe(
      tap(user => {
        this.disconnect();
        if (user && user.token) {
          this.socket.ioSocket['auth'] = user.token;
          this.connect();
        }
      })
    );
    const pipe1 = this.authService.token$.pipe(
      tap(token => {
        this.socket.ioSocket['auth'] = token;
      })
    );
    return merge(pipe1, pipe2).pipe(switchMap(() => EMPTY));
  }

  disconnect() {
    this.socket.disconnect();
    this.connected = false;
  }

  connect() {
    console.log("Connecting...")
    if (!this.connected) {
      this.socket.connect(err => {
        console.error(err)
      })
    }
    this.emit('updates_request', '2001-01-01T00:00:00.000000')
  }

  fromEvent<T>(key: string) {
    return this.socket.fromEvent<SocketResp<T>>(key).pipe(
      tap(() => console.debug(`Socket '${key}' received`)),
      map(resp => resp.data),
    );
  }

  emit(key: string, ...data: any) {
    console.debug(`Emitting socket '${key}'...`);
    this.socket.emit(key, ...data);
  }
}
