import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../core/services/auth.service";
import {catchError, EMPTY} from "rxjs";
import {SocketService} from "../../core/services/socket.service";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  email: string = "";
  password: string = "";
  error: string = "";

  constructor(private readonly router: Router,
              private readonly authService: AuthService,
              private readonly socket: SocketService) { }

  ngOnInit() {
    // this.authService.userChanged$.subscribe(user => {
    //   if (user !== null) {
    //     void this.router.navigate(['/home']);
    //   }
    // })
  }

  signIn() {
    this.authService.signInWithPassword(this.email, this.password).pipe(catchError(err => {
      console.log(err)
      this.error = err['error']['error']['message'];
      return EMPTY;
    })).subscribe(() => {
      this.error = ""
      void this.router.navigate(['/home']);
    });
  }

}
