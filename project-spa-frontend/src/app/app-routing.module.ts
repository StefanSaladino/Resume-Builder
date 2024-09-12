import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import standalone components directly
import { BasicInfoComponent } from './components/basic-info/basic-info.component';
import { EducationComponent } from './components/education/education.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { VolunteerComponent } from './components/volunteer/volunteer.component';
import { SkillsComponent } from './components/skills/skills.component';
import { SummaryComponent } from './components/summary/summary.component';
import { LoginComponent } from './components/login/login.component';

// Declare the routes array
export const routes: Routes = [
  { path: '', redirectTo: '/basic-info', pathMatch: 'full' },
  { path: 'basic-info', component: BasicInfoComponent },
  { path: 'education', component: EducationComponent },
  { path: 'experience', component: ExperienceComponent },
  { path: 'volunteer', component: VolunteerComponent },
  { path: 'skills', component: SkillsComponent },
  { path: 'summary', component: SummaryComponent },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
