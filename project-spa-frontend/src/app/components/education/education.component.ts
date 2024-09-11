import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule

@Component({
  selector: 'app-education',
  standalone: true, // Standalone component declaration
  imports: [CommonModule, ReactiveFormsModule], // Import CommonModule and ReactiveFormsModule here
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit {
  educationForm!: FormGroup; // FormGroup to manage education form
  educations: any[] = []; // List of educations

  constructor(
    private fb: FormBuilder, // FormBuilder for form creation
    private router: Router, // Router for navigation
    private formDataService: FormDataService // Service to manage form data
  ) {}

  ngOnInit() {
    // Initialize the education form with form controls and validators
    this.educationForm = this.fb.group({
      schoolName: ['', Validators.required],
      degreeType: ['', Validators.required],
      degreeName: ['', Validators.required],
      startDate: ['', [Validators.required, this.validateDateFormat]],
      endDate: ['', this.validateOptionalEndDate],
      details: [''],
    });

    // Retrieve any previously added education data
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
      return null; // Empty value is valid (no end date provided)
    }
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/; // mm/yyyy format
    if (!datePattern.test(control.value)) {
      return { invalidDate: true }; // Invalid date format
    }
    return null; // Valid date format
  }
  

  // Add new education entry
  onAddEducation() {
      if (this.educationForm.valid) {
        const formValue = this.educationForm.value;
        if (!formValue.endDate) {
          formValue.endDate = 'Present';
        }
  
        // Log the form values to console
        console.log('Form Values:', formValue);
  
        this.educations.push(formValue);
        this.educationForm.reset();
      } else {
        // Trigger form validation if there are errors
        this.educationForm.markAllAsTouched();
      }
    }

  // Remove education entry by index
  removeEducation(index: number) {
    this.educations.splice(index, 1);
  }

  // Navigate to the Experience page
  onNext() {
    this.router.navigate(['/experience']);
  }

  // Navigate back to the Basic Info page
  onBack() {
    this.router.navigate(['/basic-info']);
  }
}
