import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SvgIconComponent } from './svg-icon.component';
import { DomSanitizer } from '@angular/platform-browser';

describe('SvgIconComponent', () => {
  let component: SvgIconComponent;
  let fixture: ComponentFixture<SvgIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgIconComponent],
      providers: [DomSanitizer]
    }).compileComponents();

    fixture = TestBed.createComponent(SvgIconComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
