import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormDataService } from '../../../services/form-data.service';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
})
export class BasicInfoComponent implements OnInit {
  basicInfoForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private formDataService: FormDataService
  ) {}

  ngOnInit() {
    this.basicInfoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      address: ['', Validators.required],
    });

    // Populate form if data exists
    const basicInfo = this.formDataService.getBasicInfo();
    if (basicInfo) {
      this.basicInfoForm.patchValue(basicInfo);
    }
  }

  onNext() {
    this.formDataService.setBasicInfo(this.basicInfoForm.value);
    this.router.navigate(['/education']);
  }
}
