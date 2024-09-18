import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {
  BehaviorSubject,
  distinctUntilChanged,
  from,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from "rxjs";
import {SignInResponse} from "../models/sign_in_resp";
import {User} from "../models/user";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly firebaseApiKey = "AIzaSyA8z4fe_VedzuLvLQk9HnQTFnVeJDRdxkc";

  private readonly user$$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.user$$.pipe(
    shareReplay(1)
  );
  userChanged$: Observable<User | null> = this.user$.pipe(
    distinctUntilChanged((previous, current) => previous?.uid !== current?.uid),
    switchMap(user => {
      if (user === null) {
        return from(this.router.navigateByUrl('/auth')).pipe(map(() => null))
      }
      return of(user);
    })
  );
  token$: Observable<string | null> = this.user$.pipe(map(user => user?.token ?? null), distinctUntilChanged());

  signInWithPassword(login: string, password: string) {
    return this.http.post<SignInResponse>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.firebaseApiKey}`,
      {
        email: login,
        password: password,
        returnSecureToken: true,
      }).pipe(
      map(resp => {
        this.user$$.next({
          uid: resp.uid,
          email: resp.email,
          token: resp.idToken,
          refreshToken: resp.refreshToken,
        });
      }));
  }

  signOut() {
    this.user$$.next(null)
  }
}
