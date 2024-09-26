import {inject, Injectable} from '@angular/core';
import {Storage} from "@ionic/storage-angular";
import {from, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly storage = inject(Storage);
  private created: boolean = false;

  constructor() {
    this.storage.create().then(() => {
      this.created = true;
      console.log("Created");
    });
  }

  set(key: string, value: any) {
    if (!this.created)
      return;
    void this.storage.set(key, value);
  }

  get<T>(key: string): Observable<T | null> {
    return from(this.storage.get(key)).pipe(
      // tap(console.log)
    );
  }
}
