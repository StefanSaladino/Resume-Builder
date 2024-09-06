import { Injectable } from '@angular/core';

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

  // Basic Info
  setBasicInfo(data: any) {
    this.formData.basicInfo = data;
  }

  getBasicInfo() {
    return this.formData.basicInfo;
  }

  // Education
  addEducation(data: any) {
    this.formData.education.push(data);
  }

  getEducation() {
    return this.formData.education;
  }

  // Similar methods for Experience, Volunteer, Skills...

  // Get All Data
  getFormData() {
    return this.formData;
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
