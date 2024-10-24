import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../app.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage:string='';
  @Output() login: EventEmitter<void> = new EventEmitter<void>();
  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (this.authService.login(this.username, this.password)) {
      // Navigate to the form page
    //   this.router.navigate(['/form']);
    this.login.emit();
    console.log('logged')
    } else {
      alert('Invalid login credentials');
    }
  }
}
