// Import the necessary modules from Angular core and router
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import the components that will be tied to specific routes in your application
//TODO: create each front end component
import { BasicInfoComponent } from './components/basic-info/basic-info.component';
import { EducationComponent } from './components/education/education.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { VolunteerComponent } from './components/volunteer/volunteer.component';
import { SkillsComponent } from './components/skills/skills.component';
import { SummaryComponent } from './components/summary/summary.component';

// Define the array of routes for your application
export const routes: Routes = [
  // Redirect to the 'basic-info' page when the root URL is accessed
  { path: '', redirectTo: '/basic-info', pathMatch: 'full' },

  // Define a route for the 'basic-info' page, linked to the BasicInfoComponent
  { path: 'basic-info', component: BasicInfoComponent },

  // Define a route for the 'education' page, linked to the EducationComponent
  { path: 'education', component: EducationComponent },

  // Define a route for the 'experience' page, linked to the ExperienceComponent
  { path: 'experience', component: ExperienceComponent },

  // Define a route for the 'volunteer' page, linked to the VolunteerComponent
  { path: 'volunteer', component: VolunteerComponent },

  // Define a route for the 'skills' page, linked to the SkillsComponent
  { path: 'skills', component: SkillsComponent },

  // Define a route for the 'summary' page, linked to the SummaryComponent
  { path: 'summary', component: SummaryComponent },
];

// Use the @NgModule decorator to configure the AppRoutingModule
@NgModule({
  // Import the RouterModule and configure it with the defined routes using forRoot()
  imports: [RouterModule.forRoot(routes)],

  // Export the RouterModule so that it can be used throughout the app
  exports: [RouterModule]
})
export class AppRoutingModule { }
