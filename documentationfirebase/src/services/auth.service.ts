import { inject, Injectable } from '@angular/core';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
} from '@angular/fire/auth';

import { Auth } from '@angular/fire/auth';

import { Router } from '@angular/router';
import { GoogleAuthProvider } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //   private firestore: Firestore = inject(Firestore); // Inyección del servicio Firestore
  constructor(private auth: Auth, private router: Router) {}

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password).then(
      (res: any) => {
        this.router.navigate(['/dashboard']);
      },
      (err) => {
        alert(err.message);

        this.router.navigate(['/register']);
      }
    );
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password).then(
      (res: any) => {
        alert('registred succesfully');
        this.router.navigate(['/login']);
        //  this.sendEmailForVerification(res.user);
      },
      (err) => {
        alert(err.message);

        this.router.navigate(['/register']);
      }
    );
  }
  sendEmailForVerification(user: any) {
    sendEmailVerification(user).then(
      (res: any) => {
        this.router.navigate(['/verify-email']);
      },
      (err: any) => {
        alert('something went wrong . Not able to send email to your email ');
      }
    );
  }

  //logout method
  logout() {
    signOut(this.auth).then(
      () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      (err) => {
        alert(err.message);
      }
    );
  }

  forgotPassword(email: string) {
    sendPasswordResetEmail(this.auth, email).then(
      () => {
        this.router.navigate(['/verify-email']);
      },
      (err) => {
        alert(err.message);
      }
    );
  }

  googleSignIn() {
    return signInWithPopup(this.auth, new GoogleAuthProvider()).then(
      (res) => {
        this.router.navigate(['/dashboard']);
        localStorage.setItem('token', JSON.stringify(res.user?.uid));
      },
      (err) => {
        alert(err.message);
      }
    );
  }
}