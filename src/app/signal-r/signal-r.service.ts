import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: signalR.HubConnection;
  
  // Subjects to manage different types of messages
  private userMessagesSubject = new Subject<{ user: string, message: string }>();
  private groupMessagesSubject = new Subject<{ group: string, message: string }>();
  private broadcastMessagesSubject = new Subject<{ message: string }>();
  private connectionIdSubject = new Subject<string>();


  public userMessages$ = this.userMessagesSubject.asObservable();
  public groupMessages$ = this.groupMessagesSubject.asObservable();
  public broadcastMessages$ = this.broadcastMessagesSubject.asObservable();
  public connectionId$ = this.connectionIdSubject.asObservable();

  constructor() {
    this.createConnection();
    this.startConnection();
    this.addReceiveMessageListeners();
  }

  private createConnection() {
    
    const userId = localStorage.getItem("userId") as string;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5258/broadcasthub?userId=${userId}`,{
        headers: {
          "userName": userId,
          "tenant-id": "bef2d565-d167-472d-b8f9-893884667622"
        },
        accessTokenFactory : () => {
          return localStorage.getItem("authToken") ?? "";
        },
        transport:signalR.HttpTransportType.WebSockets,     
      }).withAutomaticReconnect()
      .build();
  }

  private startConnection() {
    this.hubConnection
      .start()
      .then(() => {
        const connectionId = this.hubConnection.connectionId || '';
        console.log('Connection started with ID:', connectionId);
        this.connectionIdSubject.next(connectionId);
      })
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public getConnectionIdFromClient(): string {
    console.log("conectionId--service",this.hubConnection.connectionId)

    return this.hubConnection.connectionId || '';
  }

  private addReceiveMessageListeners() {
    const userId = localStorage.getItem("userId") as string;

    // Listener for messages to specific users
    this.hubConnection.on('ReceiveMessageForUser', (user: string, message: string) => {
      this.acknowledgeToServer(`${user} received messsage`)
      this.userMessagesSubject.next({ user, message });
    });

    // Listener for messages to groups
    this.hubConnection.on('ReceiveMessageForGroup', (data:{group: string, message: string}) => {
      this.acknowledgeToServer(`${userId} received message from group`)
      this.groupMessagesSubject.next({group: data.group, message: data.message});
    });

    // Listener for broadcast messages
    this.hubConnection.on('ReceiveMessage', (message: string) => {
      this.acknowledgeToServer(`${userId} receive BroadCast message`)
      this.broadcastMessagesSubject.next({ message });
    });

    this.hubConnection.on('AddedToGroup', (data:{group: string, message: string})  => {
      console.log( "Group added -->", data.group)
      // this.groupMessagesSubject.next({group: data.group, message: data.message});
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
    
    this.hubConnection.on("ReceiveUserConnectionList", (userList) => {
      if (typeof userList === 'string') {
        console.log(userList); // No active users
      } else {
        console.log("Active Users and Connections:", userList);
        userList.forEach((user:any) => {
          console.log(`User ID: ${user?.userId}, Connection ID: ${user?.connectionId}`);
        });
      }
    });

    this.hubConnection.on('BroadcastToAll', (message: any) => {
      console.log("broadcast-message", message)
    });
  }

  // Method to send a message to a specific user
  public sendMessageToUser(userId: string, message: string) {
    this.hubConnection.invoke('SendMessageToUser', userId, message)
      .catch(err => console.error(err));
  }

  // Method to send a message to a group
  public sendMessageToGroup(groupName: string, message: string) {
    this.hubConnection.invoke('SendMessageToGroup', groupName, message)
      .catch(err => console.error(err));
  }

  // Method to send a broadcast message
  public sendMessageToAll(message: string) {
    this.hubConnection.invoke('SendMessageToAll', message)
      .catch(err => console.error(err));
  }

  public getConnectionId() {
    console.log("conectionId--service",this.hubConnection.connectionId)
    this.hubConnection.invoke('GetConnectionId')
    .catch(err => console.log("err", err))
  }

  public AddUserToGroup(groupName : string) {
    this.hubConnection.invoke('AddUserToGroup', groupName)
    .catch(err => console.log("err", err))
  }

  public RemoveUserFromGroup(groupName : string) {
    this.hubConnection.invoke('RemoveUserFromGroup', groupName)
    .catch(err => console.log("err", err))
  }

  public viewAllGroups() {
    this.hubConnection.invoke('ViewAllGroups')
      .catch(err => console.error(err));
  }

  public viewAllConnections() {
    this.hubConnection.invoke('ViewAllUserConnections')
      .catch(err => console.error(err));
  }

  public acknowledgeToServer(message: string) {
    this.hubConnection.invoke('AcknowledgeFromClient', message)
      .catch(err => console.error(err));
  }
}
