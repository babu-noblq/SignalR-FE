import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChatService } from './signal-r.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signal-r',
  standalone: true,
  templateUrl: './signal-r.component.html',
  styleUrl: './signal-r.component.css',
  imports: [ReactiveFormsModule,CommonModule]
})
export class SignalRComponent {
  chatForm!: FormGroup;
  messages: { user: string, message: string }[] = [];
  groupMessages: { group: string, message: string }[] = [];
  broadcastMessages: { message: string }[] = [];
  connectionId: string = ''; 

  constructor(private fb: FormBuilder, private chatService: ChatService) {
    this.chatForm = this.fb.group({
      message: [''],
      userId: [''],
      groupName: ['']
    });
  }

  ngOnInit(): void {

    this.chatService.connectionId$.subscribe(id => {
      this.connectionId = id;
      console.log('Received connectionId:', this.connectionId);
    });

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

  viewAllConnections() {
    this.chatService.viewAllConnections();
  }
  
  addUserToGroup() {
    const userId = localStorage.getItem("userId") as string;
    const groupName = this.chatForm.value.groupName;

    if (groupName) {
      this.chatService.AddUserToGroup(groupName);
    }
  }
  
  removeUserFromGroup() {
    const userId = localStorage.getItem("userId") as string;
    const groupName = this.chatForm.value.groupName;

    if (groupName) {
      this.chatService.RemoveUserFromGroup(groupName);
    }
  }
}
