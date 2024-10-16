import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

//TODO: implement an impact/accomplishments property of the volunteer component.
@Component({
  selector: 'app-volunteer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './volunteer.component.html',
  styleUrl: './volunteer.component.css'
})
export class VolunteerComponent implements OnInit {
  volunteerForm!: FormGroup;
  volunteers: any[] = [];
  showForm: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.volunteerForm = this.fb.group({
      organization: ['', Validators.required],
      role: ['', Validators.required],
      startDate: ['', [Validators.required, this.validateDateFormat]],
      endDate: ['', this.validateOptionalEndDate],
      responsibilities: this.fb.array([this.fb.control('')], Validators.required),
    });

    this.fetchVolunteerEntries();
  }

      // Get responsibilities form array for dynamic controls
      get responsibilities(): FormArray {
        return this.volunteerForm.get('responsibilities') as FormArray;
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
  
  //TODO: ADD TO VALIDATE DATE PATTERN: Start date must be before present date.
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

  onAddVolunteer() {
    // Add new volunteer entry
    if (this.volunteerForm.valid) {
      const formValue = this.volunteerForm.value;
      if (!formValue.endDate) {
        formValue.endDate = 'Present';
      }

      // Log the form values to console
      console.log('Form Values:', formValue);

      this.volunteers.push(formValue);
      this.saveVolunteerToBackend(formValue);
      this.volunteerForm.reset();
      this.responsibilities.clear(); // Reset responsibilities array after adding experience
      this.addResponsibility(); // Add the first responsibility field back

      // Hide the form after adding the experience
      this.showForm = false;
    } else {
      // Trigger form validation if there are errors
      this.volunteerForm.markAllAsTouched();
    }
  }

  saveVolunteerToBackend(volunteer: any) {
    console.log('Saving volunteer experience:', volunteer);
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .post('http://localhost:4200/backend/resume/volunteer', volunteer, {
        headers,
      })
      .pipe(
        tap((response: any) => {
          console.log('Volunteer experience saved:', response);
          // Check if the ID is present in the response
          if (response._id) {
            this.volunteers.push({ ...volunteer, _id: response._id });
          } else {
            console.error('No ID returned from backend.');
          }
        }),
        catchError((error) => {
          console.error('Error saving volunteer experience:', error);
          return of(error);
        })
      )
      .subscribe();
  }

  cancelVolunteer() {
    // Reset the form and hide it
    this.volunteerForm.reset();
    this.responsibilities.clear();
    this.addResponsibility();
    this.showForm = false; // Hide the form when canceled
  }

  //TODO: add remove function to form data for the purposes of polymorphism
  removeVolunteer(index: number): void {
    const removedExperience = this.volunteers[index];
    console.log('Attempting to remove experience:', removedExperience); // Log the experience being removed

    if (removedExperience && removedExperience._id) {
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http
        .delete(
          `http://localhost:4200/backend/resume/volunteer/${removedExperience._id}`,
          { headers }
        )
        .pipe(
          tap(() => {
            console.log('Experience removed from backend');
            this.volunteers.splice(index, 1);
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

  fetchVolunteerEntries() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:4200/backend/resume/volunteer', { headers })
      .pipe(
        tap((response) => {
          this.volunteers = response; // Assign the response to the educations array
          this.showForm = this.volunteers.length === 0; // Show form only if no entries exist
        }),
        catchError((error) => {
          console.error('Error fetching volunteer entries:', error);
          return of([]); // Return an empty array on error
        })
      )
      .subscribe();
  }

  toggleVolunteerForm() {
    // Show or hide the form
    this.showForm = !this.showForm;
  }

  onNext() {
    this.formDataService.addVolunteer(this.volunteerForm.value);
    this.router.navigate(['/resume/skills']);
  }

  onBack() {
    this.router.navigate(['/resume/experience']); 
  }
}
