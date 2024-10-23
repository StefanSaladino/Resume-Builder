import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngIf and other common directives
import { ReactiveFormsModule } from '@angular/forms'; // For reactive forms



@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  resetToken: string;
  message: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private authService: AuthService, private router: Router) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) // At least one lowercase, one uppercase, and one number
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.isMatchingPasswords('password', 'confirmPassword') });

    this.resetToken = this.route.snapshot.params['resetToken'];
  }

  ngOnInit(): void {}

  // Custom validator to check if password and confirm password match
  isMatchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.controls[passwordKey];
      const confirmPasswordControl = formGroup.controls[confirmPasswordKey];

      if (confirmPasswordControl.errors && !confirmPasswordControl.errors['passwordMismatch']) {
        // Return if another validator has already found an error
        return;
      }

      // Set error if passwords don't match
      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ passwordMismatch: true });
      } else {
        confirmPasswordControl.setErrors(null);
      }
    };
  }

  // Method to handle form submission
  onSubmit() {
    if (this.resetPasswordForm.valid) {
      const { password, confirmPassword } = this.resetPasswordForm.value;
      console.log("Reset Token:", this.resetToken); // Log the token
      console.log("Password:", password, "Confirm Password:", confirmPassword); // Log the passwords
  
      this.authService.resetPasswordWithToken(this.resetToken, { password, confirmPassword }).subscribe(
        (response) => {
          // Expecting a JSON response
          this.message = response.message; // Set the success message from the response
          this.errorMessage = null;
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error response:', error); // Log the error response
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message; // Display the error message from the response
          } else {
            this.errorMessage = 'Error resetting the password. Please try again.';
          }
          this.message = null;
        }
      );
    }
  }
}