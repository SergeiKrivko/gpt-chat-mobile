import {Injectable} from '@angular/core';
import {Auth, signInWithEmailAndPassword, user, idToken} from "@angular/fire/auth";
import {Router} from "@angular/router";


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private auth: Auth,
              private readonly router: Router) {
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

  getUser() {
    return this.auth.currentUser;
  }

  userChanged$ =  user(this.auth)

  tokenChanged$ = idToken(this.auth)
}
