import {Injectable} from '@angular/core';
import {Auth, user, signInWithEmailAndPassword} from "@angular/fire/auth";
import {Database, ref, object, get, set, remove} from "@angular/fire/database";
import {Chat, Message} from "./data.service";


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

  public addMessage(chat: Chat, message: Message) {
    chat.remote_last++
    set(ref(this.db, `users/${this.auth.currentUser?.uid}/events/${chat.id}/${chat.remote_last}`), [
      'add', message.id
    ])
    set(ref(this.db, `users/${this.auth.currentUser?.uid}/events/${chat.id}-last`), chat.remote_last)
    set(ref(this.db, `users/${this.auth.currentUser?.uid}/messages/${chat.id}/${message.id}`), {
      id: message.id,
      content: message.content,
      role: message.role,
      ctime: message.ctime,
    })
  }

  public removeMessage(chat: Chat, message_id: string) {
    chat.remote_last++
    set(ref(this.db, `users/${this.auth.currentUser?.uid}/events/${chat.id}/${chat.remote_last}`), [
      'delete', message_id
    ])
    set(ref(this.db, `users/${this.auth.currentUser?.uid}/events/${chat.id}-last`), chat.remote_last)
    remove(ref(this.db, `users/${this.auth.currentUser?.uid}/messages/${chat.id}/${message_id}`))
    // TODO: учесть ответы на сообщения
  }

  public updateChat(chat: Chat) {
    set(ref(this.db, `users/${this.auth.currentUser?.uid}/chats/${chat.id}`), {
      id: chat.id,
      name: chat.name,
      model: "llama2-70b",
      ctime: chat.ctime,
      utime: chat.utime,
      saved_messages: 1000,
      used_messages: 1,
      temperature: 0.5,
      type: 0
    })
  }

  public async pushChat(chat: Chat) {
    chat.remote_last = 0
    this.updateChat(chat)
    await set(ref(this.db, `users/${this.auth.currentUser?.uid}/events/${chat.id}-last`), chat.remote_last)
  }

  public async removeChat(chat_id: string) {
    await remove(ref(this.db, `users/${this.auth.currentUser?.uid}/chats/${chat_id}`))
    await remove(ref(this.db, `users/${this.auth.currentUser?.uid}/messages/${chat_id}`))
    await remove(ref(this.db, `users/${this.auth.currentUser?.uid}/events/${chat_id}`))
    await remove(ref(this.db, `users/${this.auth.currentUser?.uid}/events/${chat_id}-last`))
  }
}
