import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css'],
  animations: [
    trigger('flyInAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }), // Start position
        animate('300ms ease-in', style({ transform: 'translateY(0)', opacity: 1 })) // End position
      ]),
    ]),
  ],
})
export class EducationComponent implements OnInit {
  educationForm!: FormGroup;
  educations: any[] = [];
  showForm: boolean = false; // Flag to control form visibility
  isEditing: boolean = false; // Flag to indicate if we are in edit mode
  currentEducationId: string | null = null; // Stores the ID of the education being edited

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.educationForm = this.fb.group({
      schoolName: ['', Validators.required],
      degreeType: ['', Validators.required],
      degreeName: ['', Validators.required],
      startDate: ['', [Validators.required, this.validateDateFormat]],
      endDate: ['', this.validateOptionalEndDate],
      details: [''],
    });

    this.fetchEducationEntries();
  }

  fetchEducationEntries() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('https://resume-builder-backend-ahjg.onrender.com/resume/education', { headers })
      .pipe(
        tap((response) => {
          this.educations = response; // Assign the response to the educations array
          this.showForm = this.educations.length === 0; // Show form only if no entries exist
        }),
        catchError((error) => {
          console.error('Error fetching education entries:', error);
          return of([]); // Return an empty array on error
        })
      )
      .subscribe(() => this.cdr.detectChanges()); // Trigger change detection after subscription
  }

  onAddOrUpdateEducation(event: Event) {
    event.preventDefault();
    const formValue = this.educationForm.value;
    
    // Date validation logic
const startDate = formValue.startDate;
const endDate = formValue.endDate;

const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/;
const isValidStartDate = datePattern.test(startDate);
const isValidEndDate = !endDate || endDate === 'Present' || datePattern.test(endDate);

if (!isValidStartDate) {
  this.educationForm.get('startDate')?.setErrors({ invalidDateFormat: true });
}

if (!isValidEndDate) {
  this.educationForm.get('endDate')?.setErrors({ invalidDateFormat: true });
}

if (isValidStartDate && isValidEndDate) {
  const [startMonth, startYear] = startDate.split('/').map(Number);
  const start = new Date(startYear, startMonth - 1);
  const today = new Date();

  // Check if start date is in the future
  if (start > today) {
    this.educationForm.get('startDate')?.setErrors({ startDateInFuture: true });
  }

  if (endDate !== 'Present') {
    const [endMonth, endYear] = endDate.split('/').map(Number);
    const end = new Date(endYear, endMonth - 1);

    // Check if end date is in the future
    if (end > today) {
      this.educationForm.get('endDate')?.setErrors({ endDateInFuture: true });
    }

    // Check if end date is before start date
    if (end < start) {
      this.educationForm.get('endDate')?.setErrors({ endDateBeforeStartDate: true });
    }
      }
    if (this.educationForm.valid) {
      const formValue = this.educationForm.value;
      if (!formValue.endDate) {
        formValue.endDate = 'Present';
      }

      if (this.isEditing && this.currentEducationId) {
        // Update existing education (PUT request)
        this.updateEducationInBackend(this.currentEducationId, formValue);
      } else {
        // Add new education (POST request)
        this.educations.push(formValue);
        this.formDataService.setEducation(formValue); // Save to service
        this.saveEducationToBackend(formValue);
      }

      this.educationForm.reset();
      this.isEditing = false;
      this.currentEducationId = null;
      if (this.educations.length > 0) {
        this.showForm = false; // Hide the form after submission
      }
    } else {
      this.educationForm.markAllAsTouched();
    }
  }
}

  saveEducationToBackend(education: any) {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('https://resume-builder-backend-ahjg.onrender.com/resume/education', education, { headers })
      .pipe(
        tap((response) => {
          console.log('Education info saved:', response);
        }),
        catchError((error) => {
          console.error('Error saving education info:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  updateEducationInBackend(id: string, education: any) {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`https://resume-builder-backend-ahjg.onrender.com/resume/education/${id}`, education, { headers })
      .pipe(
        tap((response) => {
          console.log('Education info updated:', response);
          const index = this.educations.findIndex((edu) => edu._id === id);
          if (index !== -1) {
            this.educations[index] = education; // Update the local education entry
          }
        }),
        catchError((error) => {
          console.error('Error updating education info:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  editEducation(education: any, index: number) {
    this.educationForm.patchValue(education);
    this.isEditing = true;
    this.currentEducationId = education._id; // Store the ID for updating
    this.showForm = true; // Show the form for editing
  }

  removeEducation(index: number) {
    if (this.educations[index]) {
      this.educations.splice(index, 1);
      this.saveEducationToBackend(this.educations[index]);
      if (this.educations.length === 0) {
        this.showForm = true; // Show the form again if no entries are left
      }
    }
  }

  showEducationForm() {
    this.showForm = true;
  }

  cancelNewEducation() {
    this.educationForm.reset();
    this.isEditing = false;
    this.currentEducationId = null;
    this.showForm = false; // Hide the form on cancel
  }

  validateDateFormat(control: any) {
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/; // mm/yyyy format
    if (!control.value || datePattern.test(control.value)) {
      return null; // Return null if valid or empty
    } else {
      return { invalidDate: true }; // Return error object if invalid
    }
  }

  validateOptionalEndDate(control: any) {
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/; // mm/yyyy format
    if (!control.value) {
      return null; // Return null if empty
    } else if (datePattern.test(control.value)) {
      return null; // Return null if valid
    } else {
      return { invalidDate: true }; // Return error object if invalid
    }
  }

  onBack() {
    this.router.navigate(['/resume/basic-info']); 
  }

  onNext() {
    this.router.navigate(['/resume/experience']); 
  }
}
