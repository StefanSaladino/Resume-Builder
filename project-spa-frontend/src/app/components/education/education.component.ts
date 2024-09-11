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
      timeframe: ['', Validators.required],
      degreeType: ['', Validators.required],
      degreeName: ['', Validators.required],
      details: [''],
    });

    // Retrieve any previously added education data
    this.educations = this.formDataService.getEducation();
  }

  // Add new education entry
  onAddEducation() {
    this.formDataService.addEducation(this.educationForm.value); // Add form data to service
    this.educations = this.formDataService.getEducation(); // Update local education list
    this.educationForm.reset(); // Reset the form after submission
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
