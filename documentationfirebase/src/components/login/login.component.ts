import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterOutlet],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit  {
  email : string =""; 
  password : string="" ; 
  
  
  constructor(private auth : AuthService) {}

  ngOnInit(): void {
    console.log('asd');
  }


login(){
  if(this.email == "" ){
    alert("please enter email ")
    return;
  }
  if(this.password == "" ){
    alert("please enter password ")
    return;
  }

  this.auth.login(this.email, this.password)
  .then(() => console.log('Registro exitoso'))
  .catch((error) => console.error('Error en login', error));

  this.email = "";
  this.password = "";

}
signInWithGoogle(){
  this.auth.googleSignIn();
}
}
