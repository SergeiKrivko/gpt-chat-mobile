import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatSettingsPageRoutingModule } from './chat-settings-routing.module';

import { ChatSettingsPage } from './chat-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatSettingsPageRoutingModule
  ],
  declarations: [ChatSettingsPage]
})
export class ChatSettingsPageModule {}
