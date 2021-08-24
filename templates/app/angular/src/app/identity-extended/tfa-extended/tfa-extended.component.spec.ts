import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TfaExtendedComponent } from './tfa-extended.component';

describe('TfaExtendedComponent', () => {
  let component: TfaExtendedComponent;
  let fixture: ComponentFixture<TfaExtendedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TfaExtendedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TfaExtendedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
