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
      this.hideIcons = this.router.url.includes('/about') || this.router.url.includes('/login') ||
      this.router.url.includes('/register');
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.isLoggedIn = true;
        this.firstName = user.firstName;
      } else {
        this.isLoggedIn = false;
        this.firstName = '';
      }
    });

    this.authService.isAuthenticated().subscribe((isAuthenticated: boolean) => {
      this.isLoggedIn = isAuthenticated;
    });
  }

  closeSlideMenu() {
    const menu = document.getElementById('rightSlideMenu');
    if (menu) {
      menu.classList.remove('show');
      document.body.style.overflow = 'auto'; // Re-enable body scrolling
    }
  }
  
  toggleSlideMenu() {
    const menu = document.getElementById('rightSlideMenu');
    if (menu) {
      menu.classList.toggle('show');
      document.body.style.overflow = menu.classList.contains('show') ? 'hidden' : 'auto';
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.isLoggedIn = false;
      this.router.navigate(['/login']);
    });
  }
}
