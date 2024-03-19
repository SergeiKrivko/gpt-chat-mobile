import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../../services/firebase.service";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage {

  constructor(private firebaseService: FirebaseService) { }

  public signIn(email: string | number | null | undefined, password: string | number | null | undefined) {
    if (email && password) {
      this.firebaseService.signIn(email as string, password as string)
    }
  }

}
