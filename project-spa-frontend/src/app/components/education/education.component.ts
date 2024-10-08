import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css'],
})
export class EducationComponent implements OnInit {
  educationForm!: FormGroup;
  educations: any[] = [];
  showForm: boolean = false; // Flag to control form visibility

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.educationForm = this.fb.group({
      schoolName: ['', Validators.required],
      degreeType: ['', Validators.required],
      degreeName: ['', Validators.required],
      startDate: ['', [Validators.required, this.validateDateFormat]],
      endDate: ['', this.validateOptionalEndDate],
      details: [''],
    });

    // Fetch existing education entries from the backend
    this.fetchEducationEntries();
  }

  validateDateFormat(control: any) {
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/;
    return datePattern.test(control.value) ? null : { invalidDate: true };
  }

  validateOptionalEndDate(control: any) {
    if (!control.value || control.value.trim() === '') {
      return null;
    }
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/;
    return datePattern.test(control.value) ? null : { invalidDate: true };
  }

  fetchEducationEntries() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:4200/backend/resume/education', { headers })
      .pipe(
        tap((response) => {
          this.educations = response; // Assign the response to the educations array
          this.showForm = this.educations.length === 0; // Show form only if no entries exist
        }),
        catchError((error) => {
          console.error('Error fetching education entries:', error);
          return of([]); // Return an empty array on error
        })
      )
      .subscribe();
  }

  onAddEducation(event: Event) {
    event.preventDefault();
    if (this.educationForm.valid) {
      const formValue = this.educationForm.value;
      if (!formValue.endDate) {
        formValue.endDate = 'Present';
      }

      // Check if this entry already exists in the educations array
      const existingEducation = this.educations.find(ed => 
        ed.schoolName === formValue.schoolName &&
        ed.degreeType === formValue.degreeType &&
        ed.degreeName === formValue.degreeName &&
        ed.startDate === formValue.startDate &&
        ed.endDate === formValue.endDate
      );

      if (existingEducation) {
        console.warn('This education entry already exists:', formValue);
        return; // Prevent duplicate entry
      }

      this.educations.push(formValue);
      this.formDataService.setEducation(formValue); // Save to service
      this.saveEducationToBackend(formValue);
      this.educationForm.reset();

      // Hide the form after submission if there is at least one education
      if (this.educations.length > 0) {
        this.showForm = false; 
      }
    } else {
      this.educationForm.markAllAsTouched();
    }
  }

  saveEducationToBackend(education: any) {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:4200/backend/resume/education', education, { headers })
      .pipe(
        tap((response) => {
          console.log('Education info saved:', response);
        }),
        catchError((error) => {
          console.error('Error saving education info:', error);
          return of(error);
        })
      ).subscribe();
  }

  removeEducation(index: number) {
    const removedEducation = this.educations.splice(index, 1)[0]; // Remove from UI

    if (removedEducation) {
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`http://localhost:4200/backend/resume/education/${removedEducation._id}`, { headers })
        .pipe(
          tap(() => {
            console.log('Education removed from backend');
          }),
          catchError((error) => {
            console.error('Error removing education:', error);
            return of(error);
          })
        ).subscribe();
    }

    // If no educations remain after removal, show the form again
    if (this.educations.length === 0) {
      this.showForm = true;
    }
  }

  onNext() {
    if (this.educations.length > 0) {
      this.router.navigate(['/resume/experience']);
    }
  }

  onBack() {
    this.router.navigate(['/resume/basic-info']);
  }

  showEducationForm() {
    this.showForm = true;
  }

  cancelNewEducation() {
    // Hide the form when canceled only if there's at least one education
    this.showForm = this.educations.length === 0;  
    this.educationForm.reset();  // Reset the form fields
  }
}