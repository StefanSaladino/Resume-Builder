import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
    constructor(private http: HttpClient) {}
  
    generateResume(userData: any, headers: HttpHeaders): Observable<any> {
      return this.http.post(
        'http://localhost:4200/backend/resume/generate-resume',
        userData,
        { headers }
      );
    }
  }
  