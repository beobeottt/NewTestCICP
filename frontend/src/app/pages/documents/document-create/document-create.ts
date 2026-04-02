import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentsService, DocumentRole } from '../../../services/documents';

@Component({
  selector: 'app-document-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './document-create.html',
  styleUrl: './document-create.css',
})
export class DocumentCreate {
  private fb = inject(FormBuilder);
  private docs = inject(DocumentsService);
  private router = inject(Router);

  roles: DocumentRole[] = ['Pending', 'Approved', 'Rejected'];
  isSubmitting = false;
  errorMessage = '';

  form = this.fb.nonNullable.group({
    title: this.fb.nonNullable.control('', [Validators.required]),
    description: this.fb.nonNullable.control(''),
    content: this.fb.nonNullable.control(''),
    role: this.fb.nonNullable.control<DocumentRole>('Pending', [Validators.required]),
    createBy: this.fb.nonNullable.control(''),
  });

  submit(): void {
    if (this.form.invalid) return;
    this.errorMessage = '';
    this.isSubmitting = true;

    const payload = this.form.getRawValue();
    this.docs.create(payload).subscribe({
      next: (created) => {
        this.router.navigateByUrl(`/documents/${created.id}`);
      },
      error: () => {
        this.errorMessage = 'Không thể tạo công văn.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
