import {Component, inject, OnInit} from '@angular/core';
import {FirebaseService} from "../../core/services/firebase.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPage implements OnInit {

  readonly authService = inject(FirebaseService);

  ngOnInit() {}

  signOut() {
    this.authService.signOut();
  }

}
