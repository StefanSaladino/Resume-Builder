import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormDataService } from '../../../services/form-data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ResumeService } from '../../../services/resume-generator.service';

@Component({
  selector: 'app-finalize-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finalize-resume.component.html',
  styleUrls: ['./finalize-resume.component.css']
})
export class FinalizeResumeComponent implements OnInit, OnDestroy {
  userInfo: any = {};
  generatedResume: string = '';
  errorMessage: string | null = null;
  isCooldown: boolean = false; // Cooldown state
  cooldownTimer: any; // Timer reference
  remainingSeconds: number = 0; // Track remaining seconds for cooldown

  constructor(
    private formDataService: FormDataService,
    private resumeService: ResumeService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.checkLogin();
    this.loadExistingResume();
  }

  checkLogin() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('https://resume-builder-backend-ahjg.onrender.com/user', { headers })
      .subscribe(user => {
        this.userInfo = user;
      }, error => {
        console.error('Error fetching user data:', error);
        this.errorMessage = 'Failed to fetch user data. Please try again.';
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
          this.saveGeneratedResume();
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
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.post('https://resume-builder-py-script.onrender.com/python-api/generate-doc', 
      { userId: this.userInfo._id },
      { headers, responseType: 'blob' }
    ).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.docx';  
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.startCooldown(); // Start cooldown after successful download
      },
      error => {
        console.error('Error downloading resume:', error);
      }
    );
  }

  temp() {
    alert("This feature is coming soon! Please bare with us while we implement it!");
    this.startCooldown(); // Start cooldown after the alert action
  }

  // Method to start the cooldown
  private startCooldown() {
    this.isCooldown = true;
    this.remainingSeconds = 60; // Set the cooldown duration in seconds
    this.cooldownTimer = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.isCooldown = false; // Reset cooldown
        clearInterval(this.cooldownTimer); // Stop the timer
      }
    }, 1000); // Update every second
  }

  ngOnDestroy() {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }
}
