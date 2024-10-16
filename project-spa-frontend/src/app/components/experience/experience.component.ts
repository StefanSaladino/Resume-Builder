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
  showForm: boolean = false; // Controls the visibility of the form

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
      responsibilities: this.fb.array(
        [this.fb.control('')],
        Validators.required
      ),
    });

    this.fetchExperienceEntries();
  }

  // Get responsibilities form array for dynamic controls
  get responsibilities(): FormArray {
    return this.experienceForm.get('responsibilities') as FormArray;
  }

  // Function to add a responsibility field
  addResponsibility() {
    this.responsibilities.push(this.fb.control('', Validators.required));
  }

  // Function to remove a responsibility field by index
  removeResponsibility(index: number) {
    if (this.responsibilities.length > 1) {
      this.responsibilities.removeAt(index);
    }
  }

  //TODO: ADD TO VALIDATE DATE PATTERN: Start date must be before today's date
  validateDateFormat(control: any) {
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (!datePattern.test(control.value)) {
      return { invalidDate: true };
    }
    return null;
  }

  //TODO: ADD TO VALIDATE DATE PATTERN: End date must be before present date and after start date.
  validateOptionalEndDate(control: any) {
    if (!control.value || control.value.trim() === '') {
      return null; // Empty value is valid (no end date provided)
    }
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/; // mm/yyyy format
    if (!datePattern.test(control.value)) {
      return { invalidDate: true }; // Invalid date format
    }
    return null; // Valid date format
  }

  onAddExperience() {
    // Add new experience entry
    if (this.experienceForm.valid) {
      const formValue = this.experienceForm.value;
      if (!formValue.endDate) {
        formValue.endDate = 'Present';
      }

      // Log the form values to console
      console.log('Form Values:', formValue);

      this.experiences.push(formValue);
      this.saveExperienceToBackend(formValue);
      this.experienceForm.reset();
      this.responsibilities.clear(); // Reset responsibilities array after adding experience
      this.addResponsibility(); // Add the first responsibility field back

      // Hide the form after adding the experience
      this.showForm = false;
    } else {
      // Trigger form validation if there are errors
      this.experienceForm.markAllAsTouched();
    }
  }

  cancelExperience() {
    // Reset the form and hide it
    this.experienceForm.reset();
    this.responsibilities.clear();
    this.addResponsibility();
    this.showForm = false; // Hide the form when canceled
  }

  removeExperience(index: number) {
    const removedExperience = this.experiences[index];
    console.log('Attempting to remove experience:', removedExperience); // Log the experience being removed

    if (removedExperience && removedExperience._id) {
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http
        .delete(
          `http://localhost:4200/backend/resume/experience/${removedExperience._id}`,
          { headers }
        )
        .pipe(
          tap(() => {
            console.log('Experience removed from backend');
            this.experiences.splice(index, 1);
          }),
          catchError((error) => {
            console.error('Error removing experience:', error);
            return of(error);
          })
        )
        .subscribe();
    } else {
      console.error(
        'Experience to remove does not exist or has no ID:',
        removedExperience
      );
    }
  }

  saveExperienceToBackend(experience: any) {
    console.log('Saving experience:', experience);
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .post('http://localhost:4200/backend/resume/experience', experience, {
        headers,
      })
      .pipe(
        tap((response: any) => {
          console.log('Work experience saved:', response);
          // Check if the ID is present in the response
          if (response._id) {
            this.experiences.push({ ...experience, _id: response._id });
          } else {
            console.error('No ID returned from backend.');
          }
        }),
        catchError((error) => {
          console.error('Error saving work experience:', error);
          return of(error);
        })
      )
      .subscribe();
  }

  fetchExperienceEntries() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:4200/backend/resume/experience', { headers })
      .pipe(
        tap((response) => {
          this.experiences = response; // Assign the response to the educations array
          this.showForm = this.experiences.length === 0; // Show form only if no entries exist
        }),
        catchError((error) => {
          console.error('Error fetching education entries:', error);
          return of([]); // Return an empty array on error
        })
      )
      .subscribe();
  }

  toggleForm() {
    // Show or hide the form
    this.showForm = !this.showForm;
  }

  onNext() {
    this.formDataService.addExperience(this.experienceForm.value);
    this.router.navigate(['/resume/volunteer']);
  }

  onBack() {
    this.router.navigate(['/resume/education']);
  }
}
