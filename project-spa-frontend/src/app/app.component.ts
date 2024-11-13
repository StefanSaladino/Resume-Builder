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
  [x: string]: any;
  isLoggedIn: boolean = false;
  firstName: string = '';
  icons = [
    { src: 'basic-info.svg', caption: 'Basic Info', route: '/resume/basic-info' },
    { src: 'school.svg', caption: 'School', route: '/resume/education' },
    { src: 'work.svg', caption: 'Experience', route: '/resume/experience' },
    { src: 'volunteer.svg', caption: 'Volunteer', route: '/resume/volunteer' },
    { src: 'skills.svg', caption: 'Skills', route: '/resume/skills' },
    { src: 'misc.svg', caption: 'Miscellaneous', route: '/resume/miscellaneous' },
    { src: 'summary.svg', caption: 'Summary', route: '/resume/summary' }
  ];

  hideIcons = false;

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.subscribe(() => {
      this.hideIcons = this.router.url.includes('/about')||this.router.url.includes('/login')||
      this.router.url.includes('/register');
    });
  }

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
      this.router.navigate(['/login']);
    });
  }
}
