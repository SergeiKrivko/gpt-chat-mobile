import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {
  distinctUntilChanged, EMPTY,
  from, interval,
  map,
  Observable,
  of,
  shareReplay, Subject,
  switchMap, tap, withLatestFrom,
} from "rxjs";
import {SignInResponse} from "../models/sign_in_resp";
import {User} from "../models/user";
import {Router} from "@angular/router";
import {StorageService} from "./storage.service";
import {RefreshResponse} from "../models/refresh_resp";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService)
  private readonly firebaseApiKey = "AIzaSyA8z4fe_VedzuLvLQk9HnQTFnVeJDRdxkc";

  private readonly user$$ = new Subject<User | null>();
  user$: Observable<User | null> = this.user$$.pipe(
    tap(user => this.storage.set('user', user)),
    shareReplay(1),
  );
  userChanged$: Observable<User | null> = this.user$.pipe(
    distinctUntilChanged((previous, current) => previous?.uid === current?.uid),
    tap(user => console.log("User changed:", user)),
    switchMap(user => {
      if (user === null) {
        return from(this.router.navigateByUrl('/auth')).pipe(map(() => null))
      }
      return of(user);
    })
  );
  token$: Observable<string | null> = this.user$.pipe(
    map(user => user?.token ?? null),
    distinctUntilChanged(),
    // tap(token => console.log("Token changed:", token)),
  );

  private readonly refreshLooper$ = interval(1000).pipe(
    withLatestFrom(this.user$),
    switchMap(([_, user]) => {
      if (user)
      if (user && user.expireAt.getTime() - Date.now() < 10000) {
        return this.refreshToken(user);
      }
      return EMPTY;
    }),
    switchMap(() => EMPTY)
  );

  init() {
    return this.storage.get<User>('user').pipe(
      tap(user => this.user$$.next(user)),
      switchMap(() => this.refreshLooper$),
    );
  }

  signInWithPassword(login: string, password: string) {
    return this.http.post<SignInResponse>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.firebaseApiKey}`,
      {
        email: login,
        password: password,
        returnSecureToken: true,
      }).pipe(
      map(resp => {
        this.user$$.next({
          uid: resp.localId,
          email: resp.email,
          token: resp.idToken,
          refreshToken: resp.refreshToken,
          expireAt: new Date(Date.now() + resp.expiresIn * 1000),
        });
      })
    );
  }

  private refreshToken(user: User) {
    console.log("Refreshing token...");
    return this.http.post<RefreshResponse>(`https://securetoken.googleapis.com/v1/token?key=${this.firebaseApiKey}`,
      {
        grant_type: 'refresh_token',
        refresh_token: user.refreshToken,
      }).pipe(
      map(resp => {
        console.log(resp);
        this.user$$.next({
          uid: user.uid,
          email: user.email,
          token: resp.id_token,
          refreshToken: resp.refresh_token,
          expireAt: new Date(Date.now() + resp.expires_in * 1000),
        });
      })
    );
  }

  signOut() {
    this.user$$.next(null)
  }
}
