import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgxTurnstileModule } from 'ngx-turnstile';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DefaultLayoutModule } from './core/default-layout/default-layout.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LoginComponent } from './modules/auth/login/login.component';
import { SharedAppModule } from './core/shared/shared.module';
import { RegisterComponent } from './modules/auth/register/register.component';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';
import { FeatureGuard } from './core/permission/guards/feature.guard';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './core/shared/interceptors/auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
//import { MonitoringComponent } from './components/monitoring/monitoring.component';
//import { SafeUrlPipe } from './components/monitoring/safe-url.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,//    MonitoringComponent, SafeUrlPipe
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    DefaultLayoutModule,
    DashboardModule,
    SharedAppModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgbModule,
    BrowserModule,
    NgxTurnstileModule
  ],
  providers: [
    FeatureGuard,
    // {
    //   provide: LocationStrategy,
    //   useClass: HashLocationStrategy
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },],
  bootstrap: [AppComponent]
})
export class AppModule { }
