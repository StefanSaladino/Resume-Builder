import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css'
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
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      responsibilities: ['', Validators.required],
    });

    const experience = this.formDataService.getExperience();
    if (experience) {
      this.experienceForm.patchValue(experience);
    }
  }

  onAddExperience() {
    this.experiences.push(this.experienceForm.value); // Add form values to the list of experiences
    this.experienceForm.reset(); // Reset the form after adding
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
