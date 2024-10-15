import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Added email validation
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService
        .login(this.loginForm.value)
        .pipe(
          tap((response: any) => {
            if (response.success) {
              // Navigate to the next page if login is successful
              this.router.navigate(['resume/basic-info']);
            }
          }),
          catchError((error) => {
            // Handle any unexpected errors
            this.errorMessage = 'An unexpected error occurred';
            console.error('Login error:', error);
            return of(null); // Returning observable of null to avoid breaking the stream
          })
        )
        .subscribe((response: any) => {
          if (!response?.success) {
            // Display the error message if login failed
            this.errorMessage = response?.message || 'Invalid credentials';
          }
        });
    } else {
      this.errorMessage = 'Please fill in all required fields';
    }
  }
}
