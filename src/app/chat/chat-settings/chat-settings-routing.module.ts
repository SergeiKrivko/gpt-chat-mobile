import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatSettingsPage } from './chat-settings.page';

const routes: Routes = [
  {
    path: '',
    component: ChatSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatSettingsPageRoutingModule {}
