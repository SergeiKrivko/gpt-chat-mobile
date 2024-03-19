import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'chat/:id',
    loadChildren: () => import('./chat/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'chat/:id/settings',
    loadChildren: () => import('./chat/chat-settings/chat-settings.module').then( m => m.ChatSettingsPageModule)
  },
  {
    path: 'signin',
    loadChildren: () => import('./auth/signin/signin.module').then(m => m.SigninPageModule)
  },  {
    path: 'signup',
    loadChildren: () => import('./auth/signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
