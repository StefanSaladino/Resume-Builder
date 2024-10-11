import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalizeResumeComponent } from './finalize-resume.component';

describe('FinalizeResumeComponent', () => {
  let component: FinalizeResumeComponent;
  let fixture: ComponentFixture<FinalizeResumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalizeResumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalizeResumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
