import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from './models/user.model';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  firstName: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Subscribe to user state to update isLoggedIn and firstName
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.isLoggedIn = true;
        this.firstName = user.firstName;
      } else {
        this.isLoggedIn = false;
        this.firstName = ''; // Clear firstName when logged out
      }
    });

    // Also check if user is already authenticated on init
    this.authService.isAuthenticated().subscribe((isAuthenticated: boolean) => {
      this.isLoggedIn = isAuthenticated;
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.isLoggedIn = false;
      this.firstName = '';  // Reset firstName on logout
      this.router.navigate(['/auth/login']);
    });
  }
}
