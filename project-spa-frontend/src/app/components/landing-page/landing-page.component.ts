import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease-in', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class LandingPageComponent implements OnInit {
  typedText: string = '';
  fullText: string =
    "You've got a dictionary in one hand and a thesaurus in the other. Meanwhile, you're frantically scouring google to figure out which buzzwords™ employers are searching for this week. Stop stressing. We've got you.";

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.checkLogin();
    this.handleScrollEvent();
    this.simulateTypingEffect();
  }

  checkLogin() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any[]>('https://resume-builder-backend-ahjg.onrender.com/landing-page', { headers })
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
    const curve = document.getElementById('curve') as unknown as SVGPathElement;
    let lastKnownScrollPosition = 0;
    const defaultCurveValue = 350;
    const curveRate = 3;
    let ticking = false;

    window.addEventListener('scroll', () => {
      lastKnownScrollPosition = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.adjustCurve(curve, lastKnownScrollPosition, defaultCurveValue, curveRate);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  adjustCurve(curve: SVGPathElement, scrollPos: number, defaultCurveValue: number, curveRate: number) {
    if (scrollPos >= 0 && scrollPos < defaultCurveValue) {
      const curveValue = defaultCurveValue - scrollPos / curveRate;
      curve.setAttribute(
        'd',
        `M 800 300 Q 400 ${curveValue} 0 300 L 0 0 L 800 0 L 800 300 Z`
      );
    }
  }

  simulateTypingEffect(): void {
    let currentIndex = 0;
    const typingSpeed = 37;

    const typeNextChar = () => {
      if (currentIndex < this.fullText.length) {
        const nextChar = this.fullText[currentIndex];
        this.typedText += nextChar;

        currentIndex++;
        setTimeout(typeNextChar, typingSpeed);
      }
    };

    typeNextChar();
  }
}
