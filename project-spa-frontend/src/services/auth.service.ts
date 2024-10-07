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
        } else {
          console.error('Login failed:', response.message);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of({ success: false, message: 'Invalid credentials' });
      })
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
}
