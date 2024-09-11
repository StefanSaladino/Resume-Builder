import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      notes: [''],
    });

    const volunteer = this.formDataService.getVolunteer();
    if (volunteer) {
      this.volunteerForm.patchValue(volunteer);
    }
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
