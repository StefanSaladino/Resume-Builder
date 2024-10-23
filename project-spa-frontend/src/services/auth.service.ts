/**
 * AuthService is responsible for managing user authentication and 
 * authorization in the application. It provides methods for user 
 * login, registration, logout, and checking if a user is authenticated. 
 * The service also handles storing and retrieving the authentication 
 * token from local storage and manages the current user state using 
 * a BehaviorSubject. It interacts with the backend API to perform 
 * user-related operations and provides an observable to track the 
 * current user's state across the application.
 */

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../app/models/user.model'; 

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = 'http://localhost:4200/backend';
  private currentUserSubject = new BehaviorSubject<User | null>(null); 
  currentUser$ = this.currentUserSubject.asObservable(); 

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.authUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response && response.success && response.token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('authToken', response.token); // Make sure to use the same token key
          }
          this.getCurrentUser().subscribe((user) => {
            if (user) {
              this.currentUserSubject.next(user);
            }
          });
          this.router.navigate(['/resume/basic-info']);
        } 
        else {
          console.error('Login failed:', response.message);
        }
      }),
      // catchError(error => {
      //   console.error('Login error:', error);
      //   return of({ success: false, message: 'Invalid credentials' });
      // })
    );
  }

  isAuthenticated(): Observable<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return of(false);
      }

      return this.http.get(`${this.authUrl}/user`, {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
        withCredentials: true,
      }).pipe(
        map((user: any) => {
          if (user) {
            this.currentUserSubject.next(user); 
          }
          return !!user;
        }),
        catchError(error => {
          console.error('Authentication error:', error);
          return of(false);
        })
      );
    } else {
      return of(false);
    }
  }

  isVerified(): Observable<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return of(false);  // User is not authenticated
      }
  
      return this.http.get(`${this.authUrl}/user`, {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
        withCredentials: true,
      }).pipe(
        map((user: any) => {
          if (user && user.isVerified) {
            return true;  // User is verified
          } else {
            return false; // User is either not found or not verified
          }
        }),
        catchError(error => {
          console.error('Verification check error:', error);
          return of(false);  // In case of error, consider as not verified
        })
      );
    } else {
      return of(false);  // If not in a browser environment
    }
  }
  

  register(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, data).pipe(
      tap((response: any) => {
        if (response && response.success) {
          console.log('Registration successful!');
        }
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return of(null);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.get(`${this.authUrl}/logout`, { withCredentials: true }).pipe(
      tap(() => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('authToken');
        }
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('Logout error:', error);
        return of(null);
      })
    );
  }

  getCurrentUser(): Observable<User | null> {
    const token = localStorage.getItem('authToken'); 
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get(`${this.authUrl}/user`, { headers, withCredentials: true }).pipe(
      map((response: any) => {
        const user = response?.user || null;
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(error => {
        console.error('Error fetching current user:', error);
        return of(null);
      })
    );
  }

  getUserId(): Observable<string | null> {
    return this.getCurrentUser().pipe(
      map(user => user ? user._id : null) // Use map to extract the user ID
    );
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.authUrl}/resend-verification-email`, { email });
  }
  
  resetPassword(emailData: { email: string }) {
    return this.http.post<any>(`${this.authUrl}/reset-password`, emailData);
  }

  resetPasswordWithToken(token: string, passwordData: { password: string, confirmPassword: string }) {
    return this.http.post<any>(`${this.authUrl}/reset-password/${token}`, passwordData);
  }
  
}
