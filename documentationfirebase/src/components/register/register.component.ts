import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone : true ,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent  {
  
  constructor(private auth: AuthService) {}
  email: string = '';
  password: string = '';

  
  Register() {
    if (this.email == '') {
      alert('please enter email ');
      return;
    }
    if (this.password == '') {
      alert('please enter password ');
      return;
    }

    this.auth.register(this.email, this.password);
    this.email = '';
    this.password = '';
  }
}
