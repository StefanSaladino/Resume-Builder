import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.css'
})
export class SkillsComponent implements OnInit {
  skillsForm!: FormGroup;
  skills: any [] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService
  ) {}

  ngOnInit() {
    this.skillsForm = this.fb.group({
      skill: ['', Validators.required],
      proficiency: ['', Validators.required],
    });

    const skills = this.formDataService.getSkills();
    if (skills) {
      this.skillsForm.patchValue(skills);
    }
  }

  onAddSkill(): void {
    if (this.skillsForm.valid) {
      this.skills.push(this.skillsForm.value); // Add form data to the skills array
      this.skillsForm.reset(); // Clear the form after submission
    }
  }

  removeSkill(index: number): void {
    this.skills.splice(index, 1); // Remove skill by index
  }

  onNext() {
    this.formDataService.addSkills(this.skillsForm.value);
    this.router.navigate(['/summary']);
  }

  onBack() {
    this.router.navigate(['/volunteer']);
  }
}