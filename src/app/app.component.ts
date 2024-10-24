import { Component, OnInit,Injectable, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from './app.service';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private validUsername = 'admin';
  private validPassword = 'password';
  private loggedIn = false;  // Track login status

  login(username: string, password: string): boolean {
    if (username === this.validUsername && password === this.validPassword) {
      this.loggedIn = true;
      return true;
    }
    return false;
  }

  isAuthenticated(): boolean {
    return this.loggedIn;
  }

  logout() {
    this.loggedIn = false;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [ReactiveFormsModule,CommonModule, LoginComponent]
})
export class AppComponent implements OnInit {
  chatForm!: FormGroup;
  messages: { user: string, message: string }[] = [];
  groupMessages: { group: string, message: string }[] = [];
  broadcastMessages: { message: string }[] = [];
  isLoggedIn: boolean = false;

  constructor(private fb: FormBuilder, private chatService: ChatService) {
    this.chatForm = this.fb.group({
      message: [''],
      userId: [''],
      groupName: ['']
    });
  }
  loginUser(): void {
    this.isLoggedIn = true;
    console.log()
  }

  ngOnInit(): void {
    // Subscribe to user messages
    this.chatService.userMessages$.subscribe(message => {
      this.messages.push(message);
    });

    // Subscribe to group messages
    this.chatService.groupMessages$.subscribe(message => {
      this.groupMessages.push(message);
    });

    // Subscribe to broadcast messages
    this.chatService.broadcastMessages$.subscribe(message => {
      this.broadcastMessages.push(message);
    });
  }

  sendMessageToUser() {
    const userId = this.chatForm.value.userId;
    const message = this.chatForm.value.message;

    if (userId && message) {
      this.chatService.sendMessageToUser(userId, message);
    }
  }

  sendMessageToGroup() {
    const groupName = this.chatForm.value.groupName;
    const message = this.chatForm.value.message;

    if (groupName && message) {
      this.chatService.sendMessageToGroup(groupName, message);
    }
  }

  sendBroadcastMessage() {
    const message = this.chatForm.value.message;

    if (message) {
      this.chatService.sendMessageToAll(message);
    }
  }

  getConnection() {
    this.chatService.getConnectionId();
  }

  viewAllGroups() {
    this.chatService.viewAllGroups();
  }
  
  addUserToGroup() {
    const groupName = this.chatForm.value.groupName;

    if (groupName) {
      this.chatService.AddUserToGroup(groupName);
    }
  }
  
  removeUserFromGroup() {
    const groupName = this.chatForm.value.groupName;

    if (groupName) {
      this.chatService.RemoveUserFromGroup(groupName);
    }
  }
}
