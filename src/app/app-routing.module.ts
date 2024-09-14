import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {HomePage} from "./pages/home/home.page";
import {AuthPage} from "./pages/auth/auth.page";
import {ChatPage} from "./pages/chat/chat.page";

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
    path: 'chat/:id',
    component: ChatPage,
  },
  // {
  //   path: 'chat/:id/settings',
  //   loadChildren: () => import('./chat/chat-settings/chat-settings.module').then( m => m.ChatSettingsPageModule)
  // },
  // {
  //   path: 'signin',
  //   loadChildren: () => import('./auth/signin/signin.module').then(m => m.SigninPageModule)
  // },
  // {
  //   path: 'signup',
  //   loadChildren: () => import('./auth/signup/signup.module').then( m => m.SignupPageModule)
  // },
  // {
  //   path: 'settings',
  //   loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
