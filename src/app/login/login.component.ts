import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators,ReactiveFormsModule,FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './login.service'; // Import LoginService
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule]

})
export class LoginComponent {
  router = inject(Router);
  loginService = inject(LoginService); // Inject LoginService

  profileForm = new FormGroup({
    username: new FormControl('', [Validators.required]), // Updated 'email' to 'username'
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  isFormsubmitted: boolean = false;

  handleLogin() {
    this.isFormsubmitted = true;
    if (this.profileForm.valid) {
      const { username, password } = this.profileForm.value;

      this.loginService.login(username!, password!).subscribe({
        next: (response) => {
          this.loginService.storeUserId(username as string)
          this.loginService.storeToken(response.token); // Store token in local storage
          this.router.navigate(['signalR']); // Redirect to signalR route
        },
        error: () => {
          alert('Invalid username or password');
        },
      });
    }
  }

  isLoginView: boolean = true;

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(5), Validators.pattern('[a-zA-Z0-9]*')]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  handleRegister(){
    alert(this.registerForm.value.username + ' | ' + this.registerForm.value.email +'|'+ this.registerForm.value.password);
    debugger;


    const isLocalData=localStorage.getItem("angular18Local");
    if(isLocalData!=null){
      const localArray =JSON.parse(isLocalData);

      localArray.push(this.registerForm.value);
      localStorage.setItem("angular18Local",JSON.stringify(localArray));

    alert('Registration Success');
    }
    else{
      const localArray=[];

      localArray.push(this.registerForm.value);
      localStorage.setItem("angular18Local",JSON.stringify(localArray));
      alert('Registration Success');
    }
  }

  class='up';
}