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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.miscForm = this.fb.group({
      type: ['', Validators.required], // Type of accomplishment: certificate, language, etc.
      title: ['', Validators.required], // Title of the certificate, language, or accomplishment
      description: [''], // Optional description field
    });

    this.fetchMiscellaneousEntries();
  }

  // Add new entry to the list
  onAddMiscellaneous() {
    if (this.miscForm.valid) {
      const formValue = this.miscForm.value;

      console.log('Miscellaneous Form Values:', formValue);

      this.miscellaneous.push(formValue);
      this.saveMiscellaneousToBackend(formValue);
      this.miscForm.reset();

      // Hide the form after adding the entry
      this.showForm = false;
    } else {
      this.miscForm.markAllAsTouched();
    }
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
        .delete(`http://localhost:4200/backend/resume/miscellaneous/${removedMiscellaneous._id}`, { headers })
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
      .post('http://localhost:4200/backend/resume/miscellaneous', miscellaneous, { headers })
      .pipe(
        tap((response: any) => {
          console.log('Miscellaneous entry saved:', response);
          if (response._id) {
            this.miscellaneous.push({ ...miscellaneous, _id: response._id });
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
      .get<any[]>('http://localhost:4200/backend/resume/miscellaneous', { headers })
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