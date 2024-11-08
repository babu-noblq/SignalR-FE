import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalRComponent } from './signal-r.component';

describe('SignalRComponent', () => {
  let component: SignalRComponent;
  let fixture: ComponentFixture<SignalRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalRComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
