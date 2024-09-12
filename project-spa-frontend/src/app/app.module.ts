import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';



@NgModule({
  imports: [
    
    BrowserModule,
    AppRoutingModule,
    RouterModule // Import RouterModule to enable routing
  ],
  providers: [provideHttpClient(withFetch())],
  // Remove declarations and bootstrap as standalone components are used
  bootstrap: [] // Empty since standalone components will be bootstrapped in a different way
})
export class AppModule { }