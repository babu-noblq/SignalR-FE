import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { AuthService } from './app.component';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  
  // Subjects to manage different types of messages
  private userMessagesSubject = new Subject<{ user: string, message: string }>();
  private groupMessagesSubject = new Subject<{ group: string, message: string }>();
  private broadcastMessagesSubject = new Subject<{ message: string }>();

  public userMessages$ = this.userMessagesSubject.asObservable();
  public groupMessages$ = this.groupMessagesSubject.asObservable();
  public broadcastMessages$ = this.broadcastMessagesSubject.asObservable();

  constructor(private authService: AuthService) {  // Inject AuthService here
    if (this.authService.isAuthenticated()) {     // Check if the user is authenticated
      this.createConnection();
      this.startConnection();
      this.addReceiveMessageListeners();
    } else {
      console.log('User not authenticated, cannot start chat connection.');
    }
  }

  private createConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5039/chatHub') // URL to your SignalR hub
      .build();
  }

  private startConnection() {
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  private addReceiveMessageListeners() {
    // Listener for messages to specific users
    this.hubConnection.on('ReceiveMessageForUser', (user: string, message: string) => {
      console.log("single-user -->", user, "single-user -message -->", message)
      this.userMessagesSubject.next({ user, message });
    });

    // Listener for messages to groups
    this.hubConnection.on('ReceiveMessageForGroup', (data:{group: string, message: string}) => {
      console.log("group-name -->", data.group, "group-message -->", data.message)
      this.groupMessagesSubject.next({group: data.group, message: data.message});
    });

    // Listener for broadcast messages
    this.hubConnection.on('ReceiveMessage', (message: string) => {
      console.log( "All-user-message -->", message)
      this.broadcastMessagesSubject.next({ message });
    });

    this.hubConnection.on('AddedToGroup', (data:{group: string, message: string})  => {
      console.log( "Group added -->", data.group)
      this.groupMessagesSubject.next({group: data.group, message: data.message});
    });

    this.hubConnection.on('RemovedFromGroup', (data:{group: string, message: string})  => {
      console.log( "Group removed -->", data.group)
      this.groupMessagesSubject.next({group: data.group, message: data.message});
    });

    this.hubConnection.on('ReceiveGroupList', (groupList: any) => {
      if (typeof groupList === 'string') {
        console.log(groupList); // "No active groups."
      } else {
        console.log('Active groups: ', groupList);
        groupList.forEach((group: any) => {
          console.log(`Group: ${group.groupName}, Users: ${group.userCount}`);
        });
      }
    });
  }

  // Method to send a message to a specific user
  public sendMessageToUser(userId: string, message: string) {
    if (this.authService.isAuthenticated()) {
      this.hubConnection.invoke('SendMessageToUser', userId, message)
        .catch(err => console.error(err));
    } else {
      console.log('User not authenticated, cannot send message to user.');
    }
  }

  // Method to send a message to a group
  public sendMessageToGroup(groupName: string, message: string) {
    if (this.authService.isAuthenticated()) {
      this.hubConnection.invoke('SendMessageToGroup', groupName, message)
        .catch(err => console.error(err));
    } else {
      console.log('User not authenticated, cannot send message to group.');
    }
  }

  // Method to send a broadcast message
  public sendMessageToAll(message: string) {
    if (this.authService.isAuthenticated()) {
      this.hubConnection.invoke('SendMessageToAll', message)
        .catch(err => console.error(err));
    } else {
      console.log('User not authenticated, cannot send broadcast message.');
    }
  }

  public getConnectionId() {
    if (this.authService.isAuthenticated()) {
      this.hubConnection.invoke('GetConnectionId')
        .catch(err => console.log("Error getting connection ID: ", err));
    } else {
      console.log('User not authenticated, cannot get connection ID.');
    }
  }

  public AddUserToGroup(groupName: string) {
    if (this.authService.isAuthenticated()) {
      this.hubConnection.invoke('AddUserToGroup', groupName)
        .catch(err => console.log("Error adding user to group: ", err));
    } else {
      console.log('User not authenticated, cannot add user to group.');
    }
  }

  public RemoveUserFromGroup(groupName: string) {
    if (this.authService.isAuthenticated()) {
      this.hubConnection.invoke('RemoveUserFromGroup', groupName)
        .catch(err => console.log("Error removing user from group: ", err));
    } else {
      console.log('User not authenticated, cannot remove user from group.');
    }
  }

  public viewAllGroups() {
    if (this.authService.isAuthenticated()) {
      this.hubConnection.invoke('ViewAllGroups')
        .catch(err => console.error(err));
    } else {
      console.log('User not authenticated, cannot view all groups.');
    }
  }
}
