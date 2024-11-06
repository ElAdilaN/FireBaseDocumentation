import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private router: Router) {}

  
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password).then(
      (res: any) => {
       //alert('registred succesfully');
        this.router.navigate(['/dashboard']);
      },
      (err) => {
        alert(err.message);

        this.router.navigate(['/register']);
      }
    );
  }

}
