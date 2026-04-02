import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentCreate } from './document-create';

describe('DocumentCreate', () => {
  let component: DocumentCreate;
  let fixture: ComponentFixture<DocumentCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
