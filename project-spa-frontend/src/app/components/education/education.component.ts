import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [],
  templateUrl: './education.component.html',
  styleUrl: './education.component.css'
})
export class EducationComponent implements OnInit {
  educationForm!: FormGroup;
  educations: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService
  ) {}

  ngOnInit() {
    this.educationForm = this.fb.group({
      schoolName: ['', Validators.required],
      timeframe: ['', Validators.required],
      degreeType: ['', Validators.required],
      degreeName: ['', Validators.required],
      details: [''],
    });

    this.educations = this.formDataService.getEducation();
  }

  onAddEducation() {
    this.formDataService.addEducation(this.educationForm.value);
    this.educations = this.formDataService.getEducation();
    this.educationForm.reset();
  }

  removeEducation(index: number) {
    this.educations.splice(index, 1);
  }

  onNext() {
    this.router.navigate(['/experience']);
  }

  onBack() {
    this.router.navigate(['/basic-info']);
  }
}
