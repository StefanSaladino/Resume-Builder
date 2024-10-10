/**
 * AuthInterceptor is an Angular HTTP interceptor that adds an Authorization header 
 * to outgoing HTTP requests if an authentication token is present in local storage. 
 * This is useful for ensuring that protected API routes receive the necessary token 
 * for user authentication.
 */

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken'); // Retrieve token from local storage
    if (token) {
      // Clone the request and add the Authorization header
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned); // Pass the cloned request to the next handler
    }
    return next.handle(req); // If no token, proceed without modifying the request
  }
}
