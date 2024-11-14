import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from './models/user.model';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

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
  resizeSubscription: Subscription | undefined;
  isBrowser: boolean;
  hideIcons = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

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

    if (this.isBrowser) {
      this.checkViewportWidth();
      window.addEventListener('resize', this.checkViewportWidth.bind(this));
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.checkViewportWidth.bind(this));
    }
  }

  toggleSlideMenu() {
    if (this.isBrowser) {
      const menu = document.getElementById('rightSlideMenu');
      if (menu) {
        menu.classList.toggle('show');
        document.body.style.overflow = menu.classList.contains('show') ? 'hidden' : 'auto';
      }
    }
  }

  closeSlideMenu() {
    if (this.isBrowser) {
      const menu = document.getElementById('rightSlideMenu');
      if (menu) {
        menu.classList.remove('show');
        document.body.style.overflow = 'auto';
      }
    }
  }

  checkViewportWidth() {
    if (this.isBrowser && window.innerWidth > 768) {
      this.closeSlideMenu(); // Close menu if width is more than 768px
    }
  }


  logout() {
    this.authService.logout().subscribe(() => {
      this.isLoggedIn = false;
      this.router.navigate(['/login']);
    });
  }
}
