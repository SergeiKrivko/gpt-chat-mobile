import {ChangeDetectionStrategy, Component, DestroyRef, inject} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../core/services/auth.service";
import {catchError, EMPTY, from, switchMap, take} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPage {
  email: string = "";
  password: string = "";
  error: string = "";

  private readonly destroyRef = inject(DestroyRef)
  private readonly router = inject(Router)
  private readonly authService = inject(AuthService)

  signIn() {
    this.authService.signInWithPassword(this.email, this.password).pipe(
      catchError(err => {
        console.log(err)
        this.error = err['error']['error']['message'];
        return EMPTY;
      }),
      switchMap(() => from(this.router.navigateByUrl('/home'))),
      take(1),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}
