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
