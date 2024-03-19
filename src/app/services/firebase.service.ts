import {Injectable} from '@angular/core';
import {Auth, user, signInWithEmailAndPassword} from "@angular/fire/auth";
import {Database, ref, object, get} from "@angular/fire/database";


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private auth: Auth,
              private db: Database) {
  }

  public signIn(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
      const user = userCredential.user;
      console.log(user?.email)
    })
      .catch((error) => {
        console.error(error.message)
      });
  }

  public signOut() {
    this.auth.signOut().then(r => console.log("Signed Out"))
  }

  public getUser() {
    return user(this.auth)
  }

  public onChats() {
      return object(ref(this.db, `users/${this.auth.currentUser?.uid}/chats`))
  }

  public onEvents() {
      return object(ref(this.db, `users/${this.auth.currentUser?.uid}/events`))
  }

  public loadMessage(chat_id: string, id: string) {
    return get(ref(this.db, `users/${this.auth.currentUser?.uid}/messages/${chat_id}/${id}`))
  }
}
