import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {getDatabase, provideDatabase} from "@angular/fire/database";
import {getAuth, provideAuth} from "@angular/fire/auth";

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

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    provideFirebaseApp(() => initializeApp(firebase_config)),
    provideDatabase(() => getDatabase()),
    provideAuth(() => getAuth())],
  providers: [{provide: RouteReuseStrategy, useClass: IonicRouteStrategy}],
  bootstrap: [AppComponent],
})
export class AppModule {
}
