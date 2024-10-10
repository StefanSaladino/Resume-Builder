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
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { CommonModule } from '@angular/common';

// Declare the routes array
//TODO: IMPLEMENT AUTH GUARD
export const routes: Routes = [
  { path: '', redirectTo: 'resume/basic-info', pathMatch: 'full' },
  { path: 'resume/basic-info', component: BasicInfoComponent, canActivate: [AuthGuard] },
  { path: 'resume/education', component: EducationComponent, canActivate: [AuthGuard] },
  { path: 'resume/experience', component: ExperienceComponent, canActivate: [AuthGuard] },
  { path: 'resume/volunteer', component: VolunteerComponent, canActivate: [AuthGuard] },
  { path: 'resume/skills', component: SkillsComponent, canActivate: [AuthGuard] },
  { path: 'resume/summary', component: SummaryComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
