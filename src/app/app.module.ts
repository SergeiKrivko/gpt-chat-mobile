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
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {SettingsPage} from "./pages/settings/settings-page.component";
import {provideHttpClient} from "@angular/common/http";
import {IonicStorageModule} from "@ionic/storage-angular";
import {ChatSettingsPageComponent} from "./pages/chat-settings-page/chat-settings-page.component";
import {ReplyItemComponent} from "./shared/reply-item/reply-item.component";
import {ArchivePageComponent} from "./pages/archive/archive-page.component";
import {NgOptimizedImage} from "@angular/common";
import {OcrModalComponent} from "./shared/ocr-modal/ocr-modal.component";

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

const config: SocketIoConfig = {url: 'https://gptchat-api.nachert.art/'};

// const config: SocketIoConfig = {url: 'http://localhost:8000/'};

@NgModule({
  declarations: [AppComponent, HomePage, AuthPage, ChatPage, BubbleComponent, SettingsPage, ChatSettingsPageComponent,
    ReplyItemComponent, ArchivePageComponent, OcrModalComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        SocketIoModule.forRoot(config),
        ChatItemComponent,
        FormsModule,
        MarkdownComponent,
        IonicStorageModule.forRoot(),
        ReactiveFormsModule,
        NgOptimizedImage
    ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    provideFirebaseApp(() => initializeApp(firebase_config)),
    provideAuth(() => getAuth()),
    provideMarkdown(),
    provideHttpClient(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
