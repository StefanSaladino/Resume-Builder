import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module'; // Import the routes array
import { provideHttpClient, withFetch } from '@angular/common/http'; // Import provideHttpClient and withFetch

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Provide the routes for the application
    provideHttpClient(withFetch()) // Provide HttpClient with fetch enabled
  ]
})
  .catch(err => console.error(err));
