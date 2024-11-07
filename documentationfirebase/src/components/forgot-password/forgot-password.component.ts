import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone:true ,
  imports:[FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent implements OnInit {
  
  constructor(private auth: AuthService) {}
  email: string = '';
  ngOnInit(): void {}

  forgotPassword() {
    this.auth.forgotPassword(this.email);
    this.email = '';
  }
}
