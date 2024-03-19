import {Component, OnInit} from '@angular/core';
import {Chat, DataService} from "../services/data.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public chats: Chat[] = []

  constructor(public data: DataService,
              private router: Router) {
  }

  ngOnInit() {
    this.data.getChats().subscribe((chats: Chat[]) => {
      this.chats = chats
    })
    this.data.firebaseService.getUser().subscribe((user) => {
      if (user && user.emailVerified)
        this.router.navigate(['home'])
      else
        this.router.navigate(['signin'])
    })
  }

  public addChat() {
    this.data.newChat()
  }

  protected readonly DataService = DataService;
}
