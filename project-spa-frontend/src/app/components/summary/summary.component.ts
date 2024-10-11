import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  resume: any = {};
  errorMessage: string = '';

  constructor(
    private router: Router,
    private formDataService: FormDataService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchResume(); // Fetch resume data when component initializes
  }

  // Fetch the resume data from the backend
  fetchResume() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>('http://localhost:4200/backend/resume/summary', { headers })
      .pipe(
        tap((response) => {
          this.resume = response;
        }),
        catchError((error) => {
          this.errorMessage = 'Error fetching resume data.';
          console.error('Error fetching resume:', error);
          return of({});
        })
      ).subscribe();
  }

  // Navigate back to edit specific sections
  editSection(section: string) {
    this.router.navigate([`/resume/${section}`]);
  }

  onNext() {
    // Proceed to final submission or other actions
    this.router.navigate(['/resume/generate-resume']); // Change as necessary
  }

  onBack() {
    this.router.navigate(['/resume/skills']);
  }
}