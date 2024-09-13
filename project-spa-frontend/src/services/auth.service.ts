import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authUrl = 'http://localhost:3000/auth'; // Backend URL

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.authUrl}/login`, credentials);
  }

  register(data: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, data);
  }

  logout(): Observable<any> {
    return this.http.get(`${this.authUrl}/logout`);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.authUrl}/current-user`);
  }
}
