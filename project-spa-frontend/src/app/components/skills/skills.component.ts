import { Component, HostListener, OnInit } from '@angular/core';
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
  editingIndex: number | null = null;
  isEditing: boolean = false;
  isMobile: boolean = window.innerWidth <= 768;
  expandedIndex: number | null = null; // Track the currently expanded skill

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService,
    private http: HttpClient
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.skillsForm = this.fb.group({
      skill: ['', Validators.required],
      proficiency: ['', Validators.required],
      description: [''],
    });

    this.fetchSkills(); // Load the skills list on component init
    this.isMobile = window.innerWidth <= 768;
  }

  // Fetch the skills entries from backend
  fetchSkills() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('https://resume-builder-backend-ahjg.onrender.com/resume/skills', { headers })
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

      if (this.editingIndex !== null) {
        this.updateSkill(formValue, this.editingIndex);
      } else {
        this.saveSkillToBackend(formValue);
      }

      this.skillsForm.reset();
      this.showForm = false;
      this.isEditing = false; // Reset after adding or editing
    } else {
      this.skillsForm.markAllAsTouched();
    }
  }

  // Save the new skill to the backend
  saveSkillToBackend(skill: any) {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('https://resume-builder-backend-ahjg.onrender.com/resume/skills', skill, { headers })
      .pipe(
        tap((response: any) => {
          console.log('Skill added:', response);
          if (response.data && response.data._id) {
            this.skills.push(response.data); 
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
      
      // Optimistically remove the skill from local state
      const removedSkillCopy = { ...removedSkill }; // Copy the skill to restore it if needed
      this.skills.splice(index, 1);
      
      this.http.delete(`https://resume-builder-backend-ahjg.onrender.com/resume/skills/${removedSkill._id}`, { headers })
        .pipe(
          catchError((error) => {
            // Handle error
            console.error('Error removing skill:', error);
            alert(`Failed to remove skill: ${error.message}`);
            // Restore the skill if the delete request fails
            this.skills.splice(index, 0, removedSkillCopy);
            return of(null); // Return null to complete the observable
          })
        )
        .subscribe(response => {
          if (!response) {
            console.log('Skill was not found or deletion failed.');
          } else {
            console.log('Skill deleted successfully', response);
          }
        });
    } else {
      const errorMessage = removedSkill ? 'Skill to remove has no ID' : 'Skill to remove does not exist';
      console.error(errorMessage, removedSkill);
      alert(errorMessage);
    }
  }
  
  

  editSkill(index: number) {
    const skillToEdit = this.skills[index];
    this.skillsForm.patchValue(skillToEdit);
    this.showForm = true;
    this.isEditing = true;
    this.editingIndex = index;
  }

  updateSkill(skill: any, index: number) {
    const updatedSkill = { ...this.skills[index], ...skill };
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .put(
        `https://resume-builder-backend-ahjg.onrender.com/resume/skills/${updatedSkill._id}`,
        updatedSkill,
        { headers }
      )
      .pipe(
        tap(() => {
          this.skills[index] = updatedSkill;
        }),
        catchError((error) => {
          console.error('Error updating skill:', error);
          return of(error);
        })
      )
      .subscribe();

    this.isEditing = false; // Reset after updating
    this.editingIndex = null;
  }

  // Show or hide the skill form
  toggleForm() {
    this.showForm = !this.showForm;
  }

  cancelSkill() {
    this.skillsForm.reset(); // Reset the form
    this.showForm = false; // Hide the form
  }

  toggleSkill(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  onNext() {
    this.formDataService.addSkills(this.skillsForm.value);
    this.router.navigate(['/resume/miscellaneous']);
  }

  onBack() {
    this.router.navigate(['/resume/volunteer']);
  }
}
