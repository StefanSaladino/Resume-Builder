import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css',
})
export class ExperienceComponent implements OnInit {
  experienceForm!: FormGroup;
  experiences: any[] = [];
  showForm: boolean = false;
  editingIndex: number | null = null;
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.experienceForm = this.fb.group({
      jobTitle: ['', Validators.required],
      company: ['', Validators.required],
      startDate: ['', [Validators.required, this.validateDateFormat]],
      endDate: ['', this.validateOptionalEndDate],
      responsibilities: this.fb.array([this.fb.control('')], Validators.required),
      achievements: ['', Validators.required] 
    });

    this.fetchExperienceEntries();
  }

  get responsibilities(): FormArray {
    return this.experienceForm.get('responsibilities') as FormArray;
  }

  addResponsibility() {
    this.responsibilities.push(this.fb.control('', Validators.required));
  }

  removeResponsibility(index: number) {
    if (this.responsibilities.length > 1) {
      this.responsibilities.removeAt(index);
    }
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

  onAddExperience() {
    const formValue = this.experienceForm.value;
    
    // Date validation logic
    const startDate = formValue.startDate;
    const endDate = formValue.endDate;
  
    // Check if the start date and end date formats are valid
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/;
    const isValidStartDate = datePattern.test(startDate);
    const isValidEndDate = !endDate || endDate === 'Present' || datePattern.test(endDate);
  
    if (!isValidStartDate) {
      this.experienceForm.get('startDate')?.setErrors({ invalidDateFormat: true });
    }
  
    if (!isValidEndDate) {
      this.experienceForm.get('endDate')?.setErrors({ invalidDateFormat: true });
    }
  
    if (isValidStartDate && isValidEndDate) {
      // Check if end date is not before start date or in the future
      const [startMonth, startYear] = startDate.split('/').map(Number);
      const start = new Date(startYear, startMonth - 1);
      const today = new Date();

      // Check if start date is in the future
      if (start > today) {
        this.experienceForm.get('startDate')?.setErrors({ startDateInFuture: true });
      }
  
      if (endDate !== 'Present') {
        const [endMonth, endYear] = endDate.split('/').map(Number);
        const end = new Date(endYear, endMonth - 1);
        
  
        if (end > today) {
          this.experienceForm.get('endDate')?.setErrors({ endDateInFuture: true });
        }
  
        if (end < start) {
          this.experienceForm.get('endDate')?.setErrors({ endDateBeforeStartDate: true });
        }
      }
    if (this.experienceForm.valid) {
      const formValue = this.experienceForm.value;
      if (!formValue.endDate) {
        formValue.endDate = 'Present';
      }

      if (this.editingIndex !== null) {
        this.updateExperience(formValue, this.editingIndex);
      } else {
        this.saveExperienceToBackend(formValue);
      }

      this.experienceForm.reset();
      this.responsibilities.clear();
      this.addResponsibility();
      this.showForm = false;
      this.isEditing = false; // Reset after adding or editing
    } else {
      this.experienceForm.markAllAsTouched();
    }
  }
}

  editExperience(index: number) {
    const experienceToEdit = this.experiences[index];
    this.experienceForm.patchValue(experienceToEdit);
    this.responsibilities.clear();
    experienceToEdit.responsibilities.forEach((resp: string) => {
      this.responsibilities.push(this.fb.control(resp, Validators.required));
    });
    this.showForm = true;
    this.isEditing = true; // Set to true when editing
    this.editingIndex = index;
  }

  cancelExperience() {
    this.experienceForm.reset();
    this.responsibilities.clear();
    this.addResponsibility();
    this.showForm = false;
    this.isEditing = false; // Reset when canceling
    this.editingIndex = null;
  }

  removeExperience(index: number) {
    const removedExperience = this.experiences[index];
    if (removedExperience && removedExperience._id) {
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http
        .delete(
          `https://resume-builder-3aba3.web.app/backend/resume/experience/${removedExperience._id}`,
          { headers }
        )
        .pipe(
          tap(() => {
            this.experiences.splice(index, 1);
          }),
          catchError((error) => {
            console.error('Error removing experience:', error);
            return of(error);
          })
        )
        .subscribe();
    }
  }

  saveExperienceToBackend(experience: any) {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .post('https://resume-builder-3aba3.web.app/backend/resume/experience', experience, {
        headers,
      })
      .pipe(
        tap((response: any) => {
          this.experiences.push({ ...experience, _id: response._id });
        }),
        catchError((error) => {
          console.error('Error saving experience:', error);
          return of(error);
        })
      )
      .subscribe();
  }

  updateExperience(experience: any, index: number) {
    const updatedExperience = { ...this.experiences[index], ...experience };
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .put(
        `https://resume-builder-3aba3.web.app/backend/resume/experience/${updatedExperience._id}`,
        updatedExperience,
        { headers }
      )
      .pipe(
        tap(() => {
          this.experiences[index] = updatedExperience;
        }),
        catchError((error) => {
          console.error('Error updating experience:', error);
          return of(error);
        })
      )
      .subscribe();

    this.isEditing = false; // Reset after updating
    this.editingIndex = null;
  }

  fetchExperienceEntries() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any[]>('https://resume-builder-3aba3.web.app/backend/resume/experience', {
        headers,
      })
      .pipe(
        tap((response) => {
          this.experiences = response;
          this.showForm = this.experiences.length === 0;
        }),
        catchError((error) => {
          console.error('Error fetching experiences:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    this.isEditing = false; // Reset when toggling form
    this.editingIndex = null;
  }

  onNext() {
    this.formDataService.addExperience(this.experiences);
    this.router.navigate(['/resume/volunteer']);
  }

  onBack() {
    this.router.navigate(['/resume/education']);
  }
}
