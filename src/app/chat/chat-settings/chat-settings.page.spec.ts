import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatSettingsPage } from './chat-settings.page';

describe('ChatSettingsPage', () => {
  let component: ChatSettingsPage;
  let fixture: ComponentFixture<ChatSettingsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChatSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
