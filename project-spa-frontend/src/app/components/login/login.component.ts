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
  errorMessage: string | null = null;
  showResendEmailOption: boolean = false;

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
  
  
}
