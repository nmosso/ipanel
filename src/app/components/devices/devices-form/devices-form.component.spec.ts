import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicesFormComponent } from './devices-form.component';

describe('UserFormComponent', () => {
  let component: DevicesFormComponent;
  let fixture: ComponentFixture<DevicesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DevicesFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevicesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
