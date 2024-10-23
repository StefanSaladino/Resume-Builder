import { ChangeDetectorRef, Component } from '@angular/core';
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
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  resetForm: FormGroup;
  errorMessage: string | null = null;
  showResendEmailOption: boolean = false;
  resetPasswordMessage: string | null = null; // For success messages on password reset
  showResetForm: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdRef: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Added email validation
      password: ['', [Validators.required]],
    });
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    })
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
          catchError((error: HttpErrorResponse) => {
            console.error('Full error object:', error);
            
            if (error.status === 403 && error.error?.isVerified === false) {
              this.errorMessage = "Your account is not verified. Please check your email.";
              this.showResendEmailOption = true;
              this.cdRef.detectChanges();
            } else {
              this.errorMessage = error.error?.message || 'An unexpected error occurred';
            }
          
            return of(null);
          })
        )
        .subscribe();
    } else {
      this.errorMessage = 'Please fill in all required fields';
    }
  }
  
  resendVerificationEmail() {
    const email = this.loginForm.get('email')?.value;
  
    this.authService.resendVerificationEmail(email)
      .subscribe(
        (response: any) => {
          console.log('Resend email success response:', response);
          if (response?.success) {
            this.errorMessage = "Verification email resent. Please check your inbox.";
            this.showResendEmailOption = false;
          } else {
            console.log('Unexpected response structure:', response);
            this.errorMessage = "Failed to resend verification email.";
          }
        },
        (error: any) => {
          console.error('Resend email error:', error);
          this.errorMessage = 'Failed to resend verification email.';
        }
      );
  }

  toggleForm(){
    this.showResetForm = true;
  }

  revertForm(){
    this.showResetForm = false;
  }
  
  forgotPassword() {
    // Prompt the user for their email
    const email = this.resetForm.get('email')?.value
  
    // Check if the user entered an email
    if (email) {
      this.authService.resetPassword({ email }) // Pass email as parameter
        .subscribe(
          (response: any) => {
            if (response?.success) {
              this.resetPasswordMessage = "Reset link sent to your email."; // Success message
              this.errorMessage = null; // Clear error message
            } else {
              this.errorMessage = "Failed to send reset link."; // Handle error
              this.resetPasswordMessage = null; // Clear success message
            }
          },
          (error: any) => {
            console.error('Reset password error:', error);
            this.errorMessage = 'Failed to send reset link.';
            this.resetPasswordMessage = null; // Clear success message
          }
        );
    } else {
      this.errorMessage = 'Email is required.'; // Handle empty input case
    }
  }
}
