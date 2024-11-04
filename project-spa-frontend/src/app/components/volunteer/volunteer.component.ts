import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';


@Component({
  selector: 'app-volunteer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './volunteer.component.html',
  styleUrl: './volunteer.component.css',
})
export class VolunteerComponent implements OnInit {
  volunteerForm!: FormGroup;
  volunteers: any[] = [];
  showForm: boolean = false;
  editingIndex: number | null = null;
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.volunteerForm = this.fb.group({
      organization: ['', Validators.required],
      role: ['', Validators.required],
      startDate: ['', [Validators.required]],
      endDate: [''],
      responsibilities: this.fb.array(
        [this.fb.control('')],
        Validators.required
      ),
      impact: [''],
    });

    this.fetchVolunteerEntries();
  }

  // Get responsibilities form array for dynamic controls
  get responsibilities(): FormArray {
    return this.volunteerForm.get('responsibilities') as FormArray;
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

  onAddVolunteer() {
    const formValue = this.volunteerForm.value;
    
    // Date validation logic
    const startDate = formValue.startDate;
    const endDate = formValue.endDate;
  
    // Check if the start date and end date formats are valid
    const datePattern = /^(0[1-9]|1[0-2])\/\d{4}$/;
    const isValidStartDate = datePattern.test(startDate);
    const isValidEndDate = !endDate || endDate === 'Present' || datePattern.test(endDate);
  
    if (!isValidStartDate) {
      this.volunteerForm.get('startDate')?.setErrors({ invalidDateFormat: true });
    }
  
    if (!isValidEndDate) {
      this.volunteerForm.get('endDate')?.setErrors({ invalidDateFormat: true });
    }
  
    if (isValidStartDate && isValidEndDate) {
      // Check if end date is not before start date or in the future
      const [startMonth, startYear] = startDate.split('/').map(Number);
      const start = new Date(startYear, startMonth - 1);
  
      if (endDate !== 'Present') {
        const [endMonth, endYear] = endDate.split('/').map(Number);
        const end = new Date(endYear, endMonth - 1);
        const today = new Date();

        // Check if start date is in the future
        if (start > today) {
          this.volunteerForm.get('startDate')?.setErrors({ startDateInFuture: true });
        }
  
        if (end > today) {
          this.volunteerForm.get('endDate')?.setErrors({ endDateInFuture: true });
        }
  
        if (end < start) {
          this.volunteerForm.get('endDate')?.setErrors({ endDateBeforeStartDate: true });
        }
      }
  
      // Proceed only if the form is valid after date validation
      if (this.volunteerForm.valid) {
        if (!formValue.endDate) {
          formValue.endDate = 'Present';
        }
  
        if (this.editingIndex !== null) {
          this.updateVolunteer(formValue, this.editingIndex);
        } else {
          this.saveVolunteerToBackend(formValue);
        }
  
        this.volunteerForm.reset();
        this.responsibilities.clear();
        this.addResponsibility();
        this.showForm = false;
        this.isEditing = false; // Reset after adding or editing
      } else {
        this.volunteerForm.markAllAsTouched();
      }
    }
  }
  

  saveVolunteerToBackend(volunteer: any) {
    console.log('Saving volunteer experience:', volunteer);
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .post('https://resume-builder-backend-ahjg.onrender.com/resume/volunteer', volunteer, {
        headers,
      })
      .pipe(
        tap((response: any) => {
          console.log('Volunteer experience added:', response);
          if (response.data && response.data._id) {
            this.volunteers.push(response.data); // Add the new volunteer experience to the displayed list
          } else {
            console.error('No ID returned from backend.');
          }
        }),
        catchError((error) => {
          console.error('Error saving volunteer experience:', error);
          return of(error);
        })
      )
      .subscribe();
  }

  cancelVolunteer() {
    // Reset the form and hide it
    this.volunteerForm.reset();
    this.responsibilities.clear();
    this.addResponsibility();
    this.showForm = false; // Hide the form when canceled
  }

  editVolunteer(index: number) {
    const volunteerToEdit = this.volunteers[index];
    if(volunteerToEdit.endDate=='Present'){
      volunteerToEdit.endDate='';
    }
    this.volunteerForm.patchValue(volunteerToEdit);
    this.responsibilities.clear();
    volunteerToEdit.responsibilities.forEach((resp: string) => {
      this.responsibilities.push(this.fb.control(resp, Validators.required));
    });
    this.showForm = true;
    this.isEditing = true;
    this.editingIndex = index;
  }

  updateVolunteer(volunteer: any, index: number) {
    const updatedVolunteer = { ...this.volunteers[index], ...volunteer };
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .put(
        `https://resume-builder-backend-ahjg.onrender.com/resume/volunteer/${updatedVolunteer._id}`,
        updatedVolunteer,
        { headers }
      )
      .pipe(
        tap(() => {
          this.volunteers[index] = updatedVolunteer;
        }),
        catchError((error) => {
          console.error('Error updating volunteer entry:', error);
          return of(error);
        })
      )
      .subscribe();

    this.isEditing = false; // Reset after updating
    this.editingIndex = null;
  }

  //TODO: add remove function to form data for the purposes of polymorphism
  removeVolunteer(index: number): void {
    const removedExperience = this.volunteers[index];
    console.log('Attempting to remove experience:', removedExperience); // Log the experience being removed

    if (removedExperience && removedExperience._id) {
      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http
        .delete(
          `https://resume-builder-backend-ahjg.onrender.com/resume/volunteer/${removedExperience._id}`,
          { headers }
        )
        .pipe(
          tap(() => {
            console.log('Experience removed from backend');
            this.volunteers.splice(index, 1);
          }),
          catchError((error) => {
            console.error('Error removing experience:', error);
            return of(error);
          })
        )
        .subscribe();
    } else {
      console.error(
        'Experience to remove does not exist or has no ID:',
        removedExperience
      );
    }
  }

  fetchVolunteerEntries() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any[]>('https://resume-builder-backend-ahjg.onrender.com/resume/volunteer', { headers })
      .pipe(
        tap((response) => {
          this.volunteers = response; // Assign the response to the educations array
          this.showForm = this.volunteers.length === 0; // Show form only if no entries exist
        }),
        catchError((error) => {
          console.error('Error fetching volunteer entries:', error);
          return of([]); // Return an empty array on error
        })
      )
      .subscribe();
  }

  toggleVolunteerForm() {
    // Show or hide the form
    this.showForm = !this.showForm;
  }

  onNext() {
    this.formDataService.addVolunteer(this.volunteerForm.value);
    this.router.navigate(['/resume/skills']);
  }

  onBack() {
    this.router.navigate(['/resume/experience']);
  }
}
