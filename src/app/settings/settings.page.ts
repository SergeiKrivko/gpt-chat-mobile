import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../services/firebase.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  constructor(public firebaseService: FirebaseService) {
    this.firebaseService.getUser().subscribe((user) => {
      if (user)
        this.user = user.email as string
    })
  }

  public user: string = ""

  public signOut() {
    this.firebaseService.signOut()
  }

}
