import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {
  skillsForm!: FormGroup;
  skills: any[] = [];
  showForm: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.skillsForm = this.fb.group({
      skill: ['', Validators.required],
      proficiency: ['', Validators.required],
      description: ['', Validators.required],
    });

    this.fetchSkills(); // Load the skills list on component init
  }

  // Fetch the skills entries from backend
  fetchSkills() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://localhost:4200/backend/resume/skills', { headers })
      .pipe(
        tap((response) => {
          this.skills = response; // Populate the skills list
          this.showForm = this.skills.length === 0; // Show the form only if no skills exist
        }),
        catchError((error) => {
          console.error('Error fetching skills entries:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  // Add a new skill entry
  onAddSkill() {
    if (this.skillsForm.valid) {
      const formValue = this.skillsForm.value;
      
      // Log the form values
      console.log('Skill Form Values:', formValue);

      this.skills.push(formValue); // Add the new skill to the list
      this.saveSkillToBackend(formValue); // Save to backend
      this.skillsForm.reset(); // Reset the form after adding
      this.showForm = false; // Hide the form
    } else {
      this.skillsForm.markAllAsTouched(); // Validate the form
    }
  }

  // Save the new skill to the backend
  saveSkillToBackend(skill: any) {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:4200/backend/resume/skills', skill, { headers })
      .pipe(
        tap((response: any) => {
          console.log('Skill saved:', response);
          if (response._id) {
            this.skills.push({ ...skill, _id: response._id });
          } else {
            console.error('No ID returned from backend.');
          }
        }),
        catchError((error) => {
          console.error('Error saving skill:', error);
          return of(error);
        })
      ).subscribe();
  }

  // Remove a skill
  removeSkill(index: number) {
    const removedSkill = this.skills[index];
    if (removedSkill && removedSkill._id) {
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`http://localhost:4200/backend/resume/skills/${removedSkill._id}`, { headers })
        .pipe(
          tap(() => {
            console.log('Skill removed from backend');
            this.skills.splice(index, 1); // Remove the skill from the array
          }),
          catchError((error) => {
            console.error('Error removing skill:', error);
            return of(error);
          })
        ).subscribe();
    } else {
      console.error('Skill to remove does not exist or has no ID:', removedSkill);
    }
  }

  // Show or hide the skill form
  toggleForm() {
    this.showForm = !this.showForm;
  }

  cancelSkill() {
    this.skillsForm.reset(); // Reset the form
    this.showForm = false; // Hide the form
  }

  onNext() {
    this.formDataService.addSkills(this.skillsForm.value);
    this.router.navigate(['/resume/summary']);
  }

  onBack() {
    this.router.navigate(['/resume/volunteer']);
  }
}
