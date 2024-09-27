import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {HomePage} from "./pages/home/home.page";
import {AuthPage} from "./pages/auth/auth.page";
import {ChatPage} from "./pages/chat/chat.page";
import {SettingsPage} from "./pages/settings/settings-page.component";
import {ChatSettingsPageComponent} from "./pages/chat-settings-page/chat-settings-page.component";

const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthPage,
  },
  {
    path: 'chat/:id/settings',
    component: ChatSettingsPageComponent
  },
  {
    path: 'chat/:id',
    component: ChatPage,
  },
  // {
  //   path: 'signin',
  //   loadChildren: () => import('./auth/signin/signin.module').then(m => m.SigninPageModule)
  // },
  // {
  //   path: 'signup',
  //   loadChildren: () => import('./auth/signup/signup.module').then( m => m.SignupPageModule)
  // },
  {
    path: 'settings',
    component: SettingsPage,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
