import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignalRComponent } from './signal-r/signal-r.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'signalR',
        component: SignalRComponent
    }
];
