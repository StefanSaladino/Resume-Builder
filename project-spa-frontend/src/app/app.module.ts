import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthInterceptor } from '../services/auth.interceptor';


@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    RouterModule // Import RouterModule to enable routing
  ],
  providers: [provideHttpClient(withFetch()), {provide: HTTP_INTERCEPTORS, useClass:AuthInterceptor, multi: true }],
  // Remove declarations and bootstrap as standalone components are used
  bootstrap: [] // Empty since standalone components will be bootstrapped in a different way
})
export class AppModule { }