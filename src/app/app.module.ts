import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {getAuth, provideAuth} from "@angular/fire/auth";
import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";
import {HomePage} from "./pages/home/home.page";
import {AuthPage} from "./pages/auth/auth.page";
import {ChatPage} from "./pages/chat/chat.page";
import {ChatItemComponent} from "./shared/chat-item/chat-item.component";
import {BubbleComponent} from "./shared/bubble/bubble.component";
import {FormsModule} from "@angular/forms";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";

const firebase_config = {
  apiKey: "AIzaSyA8z4fe_VedzuLvLQk9HnQTFnVeJDRdxkc",
  authDomain: "gpt-chat-bf384.firebaseapp.com",
  databaseURL: "https://gpt-chat-bf384-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gpt-chat-bf384",
  storageBucket: "gpt-chat-bf384.appspot.com",
  messagingSenderId: "702554114523",
  appId: "1:702554114523:web:745ae5be44663f06f53ffe",
  measurementId: "G-J9JR3WD37F"
}

const config: SocketIoConfig = { url: 'http://localhost:8000', options: {} };

@NgModule({
  declarations: [AppComponent, HomePage, AuthPage, ChatPage, BubbleComponent],
  imports: [
    BrowserModule, IonicModule.forRoot(), AppRoutingModule, SocketIoModule.forRoot(config), ChatItemComponent, FormsModule, MarkdownComponent
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    provideFirebaseApp(() => initializeApp(firebase_config)),
    provideAuth(() => getAuth()),
    provideMarkdown(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
