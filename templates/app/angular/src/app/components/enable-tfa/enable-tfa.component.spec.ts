import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableTfaComponent } from './enable-tfa.component';

describe('EnableTfaComponent', () => {
  let component: EnableTfaComponent;
  let fixture: ComponentFixture<EnableTfaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnableTfaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnableTfaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
