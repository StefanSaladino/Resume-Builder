import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FormDataService {
  private formData: any = {
    basicInfo: {},
    education: [],
    experience: [],
    volunteer: [],
    skills: [],
  };

  private apiUrl = 'http://localhost:4200/backend';

  constructor(private http: HttpClient) {}

  // Basic Info
  setBasicInfo(data: any) {
    this.formData.basicInfo = data;
  }

  getBasicInfo() {
    return this.formData.basicInfo;
  }

  // Education
  setEducation(data: any) {
    this.formData.education.push(data);
  }

  getEducation() {
    return this.formData.education;
  }

  // Experience
  addExperience(data: any) {
    this.formData.experience.push(data);
  }

  getExperience() {
    return this.formData.experience;
  }

  // Volunteer
  addVolunteer(data: any) {
    this.formData.volunteer.push(data);
  }

  getVolunteer() {
    return this.formData.volunteer;
  }

  // Skills
  addSkills(data: any) {
    this.formData.skills.push(data);
  }

  getSkills() {
    return this.formData.skills;
  }

  // Get All Data
  getFormData() {
    return this.formData;
  }

  getResume(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/resume/${userId}`, { withCredentials: true });
  }

  // Reset Form Data
  resetFormData() {
    this.formData = {
      basicInfo: {},
      education: [],
      experience: [],
      volunteer: [],
      skills: [],
    };
  }
}
