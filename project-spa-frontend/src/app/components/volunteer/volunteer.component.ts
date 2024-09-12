import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService
  ) {}

  ngOnInit() {
    this.volunteerForm = this.fb.group({
      organization: ['', Validators.required],
      role: ['', Validators.required],
      startDate: ['', [Validators.required, this.validateDateFormat]],
      endDate: ['', this.validateOptionalEndDate],
      responsibilities: this.fb.array([this.fb.control('')], Validators.required),
    });

    const volunteer = this.formDataService.getVolunteer();
    if (volunteer) {
      this.volunteerForm.patchValue(volunteer);
    }
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
  
  validateDateFormat(control: any) {
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/;
    if (!datePattern.test(control.value)) {
      return { invalidDate: true };
    }
    return null;
  }

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

  onAddVolunteer(): void {
    if (this.volunteerForm.valid) {
      this.volunteers.push(this.volunteerForm.value); // Add form data to the volunteers array
      this.volunteerForm.reset(); // Clear the form after submission
    }
  }

  removeVolunteer(index: number): void {
    this.volunteers.splice(index, 1); // Remove volunteer by index
  }

  onNext() {
    this.formDataService.addVolunteer(this.volunteerForm.value);
    this.router.navigate(['/skills']);
  }

  onBack() {
    this.router.navigate(['/experience']); 
  }
}
