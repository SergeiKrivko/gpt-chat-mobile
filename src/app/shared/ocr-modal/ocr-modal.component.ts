import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {EMPTY, from, switchMap, tap} from "rxjs";
import {Camera, CameraResultType, Photo} from "@capacitor/camera";
import {TranslateService} from "../../core/services/translate.service";
import {IonModal} from "@ionic/angular";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-ocr-modal',
  templateUrl: './ocr-modal.component.html',
  styleUrls: ['./ocr-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OcrModalComponent implements OnInit {

  @ViewChild(IonModal) private readonly modal: IonModal | undefined;

  @Output() onSend = new EventEmitter<string>();

  private readonly translateService = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  protected isOpen: boolean = false;
  protected readonly languageControl = new FormControl('rus');
  protected readonly textControl = new FormControl('');
  private photo: Photo | undefined;

  ngOnInit() {
    this.languageControl.valueChanges.pipe(
      tap(console.log),
      switchMap(() => this.extract()),
    ).subscribe();
  }

  private getPhoto() {
    return from(Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64
    }));
  }

  cancel() {
    this.modal?.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal?.dismiss('message', 'confirm');
    if (this.textControl.value)
      this.onSend.emit(this.textControl.value);
  }

  private extract() {
    if (this.photo) {
      return this.translateService.extractText(`data:image/${this.photo.format};base64,${this.photo.base64String}`,
        this.languageControl.value ?? 'rus').pipe(
        tap(console.log),
        tap(text => this.textControl.setValue(text))
      );
    }
    return EMPTY;
  }

  open() {
    this.isOpen = true;
    this.cdr.detectChanges();
    this.getPhoto().pipe(
      tap(photo => this.photo = photo),
      switchMap(() => this.extract()),
    ).subscribe();
  }

}
