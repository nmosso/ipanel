import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './modules/auth/guards/auth.guard';
import { DefaultLayoutComponent } from './core/default-layout/default-layout.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
//import { DashboardComponentAdmin } from './modules/dashboardadmin/dashboard.component';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';
import { AuthService } from './modules/auth/services/auth.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
     canActivate: [authGuard],
    data: {
      title: 'Inicio'
    },
    children: [
      { path: 'users', loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule) },
      { path: 'clients', loadChildren: () => import('./components/clients/clients.module').then(m => m.ClientsModule) },
      { path: 'devices', loadChildren: () => import('./components/devices/devices.module').then(m => m.DevicesModule) },
      { path: 'devices/:clientid', loadChildren: () => import('./components/devices/devices.module').then(m => m.DevicesModule) },
      { path: 'resellers', loadChildren: () => import('./components/tenants/tenant.module').then(m => m.TenantModule) },
      { path: 'params', loadChildren: () => import('./components/parameters/parameter.module').then(m => m.ParameterModule) },
      { path: 'logout', loadChildren: () => import('./modules/auth/services/auth.service').then(m => m.AuthService) },  

    ]
  },
  {
    path: 'login',
    // canActivate: [authGuard],
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'dashboard',
    // canActivate: [authGuard],
    component: DashboardComponent,
    data: {
      title: 'Login Page'
    }
   },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: {
      title: 'Reset Password Page'
    }
  },
  {path: '**', redirectTo: 'dashboard'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
