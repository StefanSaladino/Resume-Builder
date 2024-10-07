import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http'; 
import { AuthInterceptor } from './services/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Provide the routes for the application
    provideHttpClient(withFetch()), // Provide HttpClient with fetch enabled
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
  .catch(err => console.error(err));
