import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "../../core/services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-settings',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPage implements OnInit {

  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit() {}

  signOut() {
    this.authService.signOut();
    void this.router.navigate(['/auth']);
  }

}
