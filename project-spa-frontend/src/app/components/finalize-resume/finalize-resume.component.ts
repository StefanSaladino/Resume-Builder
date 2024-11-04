import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormDataService } from '../../../services/form-data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ResumeService } from '../../../services/resume-generator.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-finalize-resume',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './finalize-resume.component.html',
  styleUrls: ['./finalize-resume.component.css']
})
export class FinalizeResumeComponent implements OnInit, OnDestroy {
  userInfo: any = {};
  generatedResume: string = ''; // Define the 'generatedResume' property correctly
  error: string = ''; // Variable to store error messages
  resumeHtml: string | null = null;
  errorMessage: string | null = null;
  isGenerateCooldown: boolean = false; // Cooldown state for generating resume
  isDownloadCooldown: boolean = false; // Cooldown state for downloading resume
  cooldownTimer: Subscription | null = null; // Timer reference

  constructor(
    private formDataService: FormDataService,
    private resumeService: ResumeService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.checkLogin(); // Check user login status when component loads
    this.loadExistingResume();
  }

  checkLogin() {
    const token = localStorage.getItem('authToken'); // Get token from localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Set Authorization header

    this.http.get<any[]>('https://resume-builder-backend-ahjg.onrender.com/user', { headers })
      .subscribe(user => {
        this.userInfo = user; // Set user data from backend
      }, error => {
        console.error('Error fetching user data:', error); // Log error in case of failure
        this.errorMessage = 'Failed to fetch user data. Please try again.'; // Set error message
      });
  }

  loadExistingResume() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<any>('https://resume-builder-backend-ahjg.onrender.com/resume/generate-resume', { headers })
      .subscribe(
        (response) => {
          if (response && response.generatedResume) {
            this.generatedResume = response.generatedResume;
          }
        },
        error => {
          console.error('Error fetching saved resume:', error);
        }
      );
  }

  generateResume() {
    if (this.isGenerateCooldown) {
      console.warn('Generate Resume is on cooldown.');
      return; // Prevent generating a resume if on cooldown
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.resumeService.generateResume({}, headers).subscribe(
      (response: any) => {
        if (response && response.msg) {
          this.generatedResume = response.msg;
          
          // Save the generated resume to the backend
          this.saveGeneratedResume();
          
          // Start cooldown for generating resume
          this.startGenerateCooldown();
        } else {
          console.error('Failed to generate resume');
        }
      },
      error => {
        console.error('Error during resume generation:', error);
      }
    );
  }

  saveGeneratedResume() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.post('https://resume-builder-backend-ahjg.onrender.com/resume/generate-resume', 
      { generatedResume: this.generatedResume }, 
      { headers }
    ).subscribe(
      (response) => {
        console.log('Resume saved successfully');
      },
      error => {
        console.error('Error saving resume:', error);
      }
    );
  }
  
  downloadResume() {
    if (this.isDownloadCooldown) {
      console.warn('Download Resume is on cooldown.');
      return; // Prevent downloading if on cooldown
    }

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.post('https://resume-builder-backend-ahjg.onrender.com/python-api/generate-doc', 
      { userId: this.userInfo._id },  // Pass the userId to Python API
      { headers, responseType: 'blob' }
    ).subscribe(
      (blob) => {
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.docx';  // Name of the downloaded file
        a.click();
        
        // Clean up the URL object
        window.URL.revokeObjectURL(url);
        
        // Start cooldown for downloading resume
        this.startDownloadCooldown();
      },
      error => {
        console.error('Error downloading resume:', error);
      }
    );
  }

  temp() {
    alert("This feature is coming soon! Please bear with us while we implement it!");
    this.startDownloadCooldown(); // Start cooldown after the alert action
  }

  // Method to start the cooldown for generating resume
  private startGenerateCooldown() {
    this.isGenerateCooldown = true;
    this.cooldownTimer = timer(60000).subscribe(() => {
      this.isGenerateCooldown = false; // Reset cooldown after 1 minute
    });
  }

  // Method to start the cooldown for downloading resume
  private startDownloadCooldown() {
    this.isDownloadCooldown = true;
    this.cooldownTimer = timer(60000).subscribe(() => {
      this.isDownloadCooldown = false; // Reset cooldown after 1 minute
    });
  }

  // Clean up the timer if needed
  ngOnDestroy() {
    if (this.cooldownTimer) {
      this.cooldownTimer.unsubscribe();
    }
  }
}
