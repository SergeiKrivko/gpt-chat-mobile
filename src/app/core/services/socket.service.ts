import {inject, Injectable} from '@angular/core';
import {Socket} from "ngx-socket-io";
import {EMPTY, map, merge, switchMap, tap} from "rxjs";
import {SocketResp} from "../models/socket_resp";
import {AuthService} from "./auth.service";
import {StorageService} from "./storage.service";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private readonly socket: Socket = inject(Socket)
  private readonly authService = inject(AuthService);
  private readonly storage = inject(StorageService);

  private time = '0001-01-01T00:00:00.000000';

  init() {
    console.log(this.socket.ioSocket)
    const pipe3 = this.storage.get<string>('time').pipe(
      tap(time => {
        if (time !== null) {
          this.time = time;
        }
      }),
    );
    const pipe2 = this.authService.userChanged$.pipe(
      tap(user => {
        this.disconnect();
        if (user && user.token) {
          this.socket.ioSocket['auth'] = user.token;
          this.connect();
        } else {
          this.time = '0001-01-01T00:00:00.000000';
          this.storage.remove('time');
        }
      })
    );
    const pipe1 = this.authService.token$.pipe(
      tap(token => {
        this.socket.ioSocket['auth'] = token;
      })
    );
    return merge(pipe1, pipe2, pipe3).pipe(switchMap(() => EMPTY));
  }

  disconnect() {
    this.socket.disconnect();
  }

  connect() {
    console.log("Connecting...")
    if (!this.socket.ioSocket.connected) {
      this.socket.connect(err => {
        console.error(err)
      })
    }
    this.emit('updates_request', this.time)
  }

  fromEvent<T>(key: string) {
    return this.socket.fromEvent<SocketResp<T>>(key).pipe(
      tap(() => console.debug(`Socket '${key}' received`)),
      tap(resp => this.storage.set('time', resp.time)),
      map(resp => resp.data),
    );
  }

  emit(key: string, ...data: any) {
    console.debug(`Emitting socket '${key}'...`);
    this.socket.emit(key, ...data);
  }
}
