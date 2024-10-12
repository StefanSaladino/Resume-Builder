import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.checkLogin();
    this.handleScrollEvent();
    this.addPathHoverEffect();
  }

  checkLogin() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any[]>('http://localhost:4200/backend/landing-page', { headers })
      .pipe(
        tap((response) => {
          // Handle login response
        }),
        catchError((error) => {
          console.error('Error fetching landing page:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  navigateToBasicInfo(): void {
    this.router.navigate(['/resume/basic-info']);
  }

  handleScrollEvent(): void {
    // Get the SVG path element to modify its shape during scrolling
    const curve = document.getElementById('curve') as unknown as SVGPathElement;
    let lastKnownScrollPosition = 0; // Variable to store the last known scroll position
    const defaultCurveValue = 350; // The default value for the curve's control point
    const curveRate = 3; // The rate at which the curve changes based on scroll
    let ticking = false; // Flag to prevent multiple requests in a single animation frame
  
    // Add a scroll event listener to the window
    window.addEventListener('scroll', () => {
      lastKnownScrollPosition = window.scrollY; // Update the last known scroll position
  
      // Check if the ticking flag is false to avoid multiple requests
      if (!ticking) {
        // Request the next animation frame
        window.requestAnimationFrame(() => {
          // Adjust the curve based on the current scroll position
          this.adjustCurve(curve, lastKnownScrollPosition, defaultCurveValue, curveRate);
          ticking = false; // Reset the ticking flag
        });
        ticking = true; // Set the ticking flag to true to avoid additional requests
      }
    });
  }
  
  adjustCurve(curve: SVGPathElement, scrollPos: number, defaultCurveValue: number, curveRate: number) {
    // Check if the scroll position is within the valid range
    if (scrollPos >= 0 && scrollPos < defaultCurveValue) {
      // Calculate the new curve value based on the scroll position
      const curveValue = defaultCurveValue - scrollPos / curveRate;
  
      // Update the 'd' attribute of the path to change its shape
      curve.setAttribute(
        'd',
        `M 800 300 Q 400 ${curveValue} 0 300 L 0 0 L 800 0 L 800 300 Z`
      );
    }
  }
  
  addPathHoverEffect(): void {
    // Get the SVG path element to apply hover effects
    const pathElement = document.getElementById('curve');
  
    if (pathElement) {
      // Add mouseover event listener to change the curve when hovered
      pathElement.addEventListener('mouseover', () => {
        // Set the 'd' attribute to a new value for the hover effect
        pathElement.setAttribute('d', 'M 800 300 Q 400 250 0 300 L 0 0 L 800 0 L 800 300 Z');
      });
  
      // Add mouseout event listener to revert the curve when not hovered
      pathElement.addEventListener('mouseout', () => {
        // Reset the 'd' attribute to its original value
        pathElement.setAttribute('d', 'M 800 300 Q 400 350 0 300 L 0 0 L 800 0 L 800 300 Z');
      });
    }
  }
}