import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../core/services/firebase.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  email: string = "";
  password: string = "";

  constructor(private readonly router: Router,
              private readonly authService: FirebaseService) { }

  ngOnInit() {
    this.authService.userChanged$.subscribe(user => {
      if (user !== null) {
        void this.router.navigate(['/home']);
      }
    })
  }

  signIn() {
    this.authService.signIn(this.email, this.password);
  }

}
