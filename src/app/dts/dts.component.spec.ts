/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DtsComponent } from './dts.component';

describe('DtsComponent', () => {
  let component: DtsComponent;
  let fixture: ComponentFixture<DtsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DtsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DtsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
