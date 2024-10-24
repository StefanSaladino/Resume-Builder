/* form-data.service.ts
This service is responsible for managing and storing form data 
across different sections of the resume builder application, 
including basic information, education, experience, volunteer work, 
skills, and miscellaneous information. It also provides methods for 
fetching resume data from the backend and resetting the form data.*/

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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
    miscellaneous: [], // New field for miscellaneous data
  };

  private apiUrl = 'https://resume-builder-3aba3.web.app/backend';

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

  // Miscellaneous
  addMiscellaneous(data: any) {
    this.formData.miscellaneous.push(data);
  }

  getMiscellaneous() {
    return this.formData.miscellaneous;
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
      miscellaneous: [], 
    };
  }
  
}