import { Component, OnInit } from '@angular/core';
import { FormDataService } from '../../../services/form-data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { tap, catchError, of } from 'rxjs';
import { ResumeService } from '../../../services/resume-generator.service';

@Component({
  selector: 'app-finalize-resume',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './finalize-resume.component.html',
  styleUrls: ['./finalize-resume.component.css']
})
export class FinalizeResumeComponent implements OnInit {
  userInfo: any = {};
  generatedResume: string = ''; // Define the 'generatedResume' property correctly
  error: string = ''; // Variable to store error messages
  resumeHtml: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private formDataService: FormDataService,
    private resumeService: ResumeService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.checkLogin(); // Check user login status when component loads
  }

  checkLogin() {
    const token = localStorage.getItem('authToken'); // Get token from localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Set Authorization header

    this.http.get<any[]>('http://localhost:4200/backend/user', { headers })
      .subscribe(user => {
        this.userInfo = user; // Set user data from backend
        this.generateResume(); // Call the generateResume method
      }, error => {
        console.error('Error fetching user data:', error); // Log error in case of failure
        this.errorMessage = 'Failed to fetch user data. Please try again.'; // Set error message
      });
  }

  generateResume() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.resumeService.generateResume({}, headers).subscribe(
      (response: any) => {
        if (response && response.msg) {
          this.generatedResume = response.msg; // Assign the msg string received from backend
        } else {
          console.error('Failed to generate resume');
        }
      },
      error => {
        console.error('Error during resume generation:', error);
        this.errorMessage = 'An unexpected error occurred. Please check the console.';
      }
    );
  }
}