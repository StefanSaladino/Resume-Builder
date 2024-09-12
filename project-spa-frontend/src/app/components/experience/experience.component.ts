import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService
  ) {}

  ngOnInit() {
    this.experienceForm = this.fb.group({
      jobTitle: ['', Validators.required],
      company: ['', Validators.required],
      startDate: ['', [Validators.required, this.validateDateFormat]],
      endDate: ['', this.validateOptionalEndDate],
      responsibilities: this.fb.array([this.fb.control('')], Validators.required),
    });

    const experience = this.formDataService.getExperience();
    if (experience) {
      this.experienceForm.patchValue(experience);
    }
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
      this.experienceForm.reset();
      this.responsibilities.clear(); // Reset responsibilities array after adding experience
      this.addResponsibility(); // Add the first responsibility field back
    } else {
      // Trigger form validation if there are errors
      this.experienceForm.markAllAsTouched();
    }
  }

  removeExperience(index: number) {
    this.experiences.splice(index, 1); // Remove experience at the given index
  }

  onNext() {
    this.formDataService.addExperience(this.experienceForm.value);
    this.router.navigate(['/volunteer']);
  }

  onBack() {
    this.router.navigate(['/education']);
  }
}
