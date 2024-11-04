import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-miscellaneous',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './miscellaneous.component.html',
  styleUrl: './miscellaneous.component.css',
})
export class MiscellaneousComponent implements OnInit {
  miscForm!: FormGroup;
  miscellaneous: any[] = [];
  showForm: boolean = false;
  editingIndex: number | null = null;
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.miscForm = this.fb.group({
      type: ['', Validators.required], 
      title: ['', Validators.required], 
      description: [''], 
    });

    this.fetchMiscellaneousEntries();
  }

  // Add new entry to the list
  onAddMiscellaneous() {
      if (this.miscForm.valid) {
        const formValue = this.miscForm.value;
  
        if (this.editingIndex !== null) {
          this.updateMisc(formValue, this.editingIndex);
        } else {
          this.saveMiscellaneousToBackend(formValue);
        }
  
        this.miscForm.reset();
        this.showForm = false;
        this.isEditing = false; // Reset after adding or editing
      } else {
        this.miscForm.markAllAsTouched();
      }
  }

  editMisc(index: number) {
    const miscToEdit = this.miscellaneous[index];
    this.miscForm.patchValue(miscToEdit);
    this.showForm = true;
    this.isEditing = true;
    this.editingIndex = index;
  }

  updateMisc(misc: any, index: number) {
    const updatedMisc = { ...this.miscellaneous[index], ...misc };
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .put(
        `https://resume-builder-backend-ahjg.onrender.com/miscellaneous/${updatedMisc._id}`,
        updatedMisc,
        { headers }
      )
      .pipe(
        tap(() => {
          this.miscellaneous[index] = updatedMisc;
        }),
        catchError((error) => {
          console.error('Error updating miscellaneous:', error);
          return of(error);
        })
      )
      .subscribe();

    this.isEditing = false; // Reset after updating
    this.editingIndex = null;
  }

  cancelMiscellaneous() {
    this.miscForm.reset();
    this.showForm = false;
  }

  removeMiscellaneous(index: number) {
    const removedMiscellaneous = this.miscellaneous[index];
    console.log('Attempting to remove miscellaneous:', removedMiscellaneous);

    if (removedMiscellaneous && removedMiscellaneous._id) {
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http
        .delete(`https://resume-builder-backend-ahjg.onrender.com/resume/miscellaneous/${removedMiscellaneous._id}`, { headers })
        .pipe(
          tap(() => {
            console.log('Miscellaneous entry removed from backend');
            this.miscellaneous.splice(index, 1);
            // If no miscellaneous entries are left, show the form
            this.showForm = this.miscellaneous.length === 0;
          }),
          catchError((error) => {
            console.error('Error removing miscellaneous entry:', error);
            return of(error);
          })
        )
        .subscribe();
    } else {
      console.error('Miscellaneous entry to remove does not exist or has no ID:', removedMiscellaneous);
    }
  }

  saveMiscellaneousToBackend(miscellaneous: any) {
    console.log('Saving miscellaneous entry:', miscellaneous);
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .post('https://resume-builder-backend-ahjg.onrender.com/resume/miscellaneous', miscellaneous, { headers })
      .pipe(
        tap((response: any) => {
          console.log('Misc added:', response);
          if (response.data && response.data._id) {
            this.miscellaneous.push(response.data)
          } else {
            console.error('No ID returned from backend.');
          }
          this.showForm = false;
        }),
        catchError((error) => {
          console.error('Error saving miscellaneous entry:', error);
          return of(error);
        })
      )
      .subscribe();
  }

  fetchMiscellaneousEntries() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any[]>('https://resume-builder-backend-ahjg.onrender.com/resume/miscellaneous', { headers })
      .pipe(
        tap((response) => {
          this.miscellaneous = response;
          // If there are no entries, show the form by default
          this.showForm = this.miscellaneous.length === 0;
        }),
        catchError((error) => {
          console.error('Error fetching miscellaneous entries:', error);
          this.showForm = true; // If there's an error fetching entries, show the form by default
          return of([]);
        })
      )
      .subscribe();
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  onNext() {
    this.formDataService.addMiscellaneous(this.miscForm.value);
    this.router.navigate(['/resume/summary']);
  }

  onBack() {
    this.router.navigate(['/resume/skills']);
  }
}
