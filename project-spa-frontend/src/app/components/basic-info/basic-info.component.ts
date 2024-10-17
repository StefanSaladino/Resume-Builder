import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.css',
})
export class BasicInfoComponent implements OnInit {
  basicInfoForm!: FormGroup;
  private apiUrl = 'http://localhost:4200/backend/resume/basic-info';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Initialize the form with validators
    this.basicInfoForm = this.fb.group({
      emailAddress: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      desiredField: ['', Validators.required],
    });

    // Attempt to load existing basic info
    this.loadBasicInfo();
  }

  /**
   * Load existing basic info from backend if available
   */
  loadBasicInfo() {
    const token = localStorage.getItem('authToken'); // Ensure the correct token is retrieved

    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Fetch existing basic info from the backend
    this.http.get(this.apiUrl, { headers }).subscribe({
      next: (data: any) => {
        if (data && Object.keys(data).length > 0) {
          this.basicInfoForm.patchValue(data); // Populate the form with existing data
          console.log('Basic info loaded:', data);
        }
      },
      error: (err) => {
        console.error('Error loading basic info:', err);
      },
      complete: () => {
        console.log('Basic info load complete');
      },
    });
  }

  /**
   * Handle the 'Next' button to save basic info and proceed to the next form step
   */
  onNext() {
    if (this.basicInfoForm.valid) {
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      // Save the basic info using the backend endpoint
      this.http.post(this.apiUrl, this.basicInfoForm.value, { headers })
        .pipe(
          tap((response) => {
            console.log('Basic info saved:', response);
            
            // Store the basic info in the FormDataService for use in other steps
            this.formDataService.setBasicInfo(this.basicInfoForm.value);

            // Navigate to the next form step (Education step)
            this.router.navigate(['/resume/education']);
          }),
          catchError((error) => {
            console.error('Error saving basic info:', error);
            return of(error);
          })
        )
        .subscribe();
    }
  }
}
