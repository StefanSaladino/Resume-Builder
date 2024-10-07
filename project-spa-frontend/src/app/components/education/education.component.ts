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
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit {
  educationForm!: FormGroup;
  educations: any[] = [];

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

    this.educations = this.formDataService.getEducation();
  }

  validateDateFormat(control: any) {
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (!datePattern.test(control.value)) {
      return { invalidDate: true };
    }
    return null;
  }

  validateOptionalEndDate(control: any) {
    if (!control.value || control.value.trim() === '') {
      return null; 
    }
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/; 
    if (!datePattern.test(control.value)) {
      return { invalidDate: true }; 
    }
    return null;
  }

  onAddEducation() {
    if (this.educationForm.valid) {
      const formValue = this.educationForm.value;
      if (!formValue.endDate) {
        formValue.endDate = 'Present';
      }

      console.log('Form Values:', formValue);
      this.educations.push(formValue);
      this.educationForm.reset();
    } else {
      this.educationForm.markAllAsTouched();
    }
  }

  removeEducation(index: number) {
    this.educations.splice(index, 1);
  }

  onNext() {
    if (this.educationForm.valid) {
      const formValue = this.educationForm.value;
      if (!formValue.endDate) {
        formValue.endDate = 'Present';
      }

      const token = localStorage.getItem('authToken'); // Ensure the correct token key is used
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.post('http://localhost:4200/backend/resume/education', formValue, { headers })
        .pipe(
          tap((response) => {
            console.log('Education info saved:', response);
            this.formDataService.setEducation(this.educationForm.value); 
            this.router.navigate(['/resume/experience']); 
          }),
          catchError((error) => {
            console.error('Error saving education info:', error);
            return of(error); 
          })
        )
        .subscribe();
    } else {
      this.educationForm.markAllAsTouched();
    }
  }

  onBack() {
    this.router.navigate(['/resume/basic-info']);
  }
}
