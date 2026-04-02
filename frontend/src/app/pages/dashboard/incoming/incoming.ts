import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

import { DocumentsService, DocumentDto, DocumentRole } from '../../../services/documents';

@Component({
  selector: 'app-incoming-documents',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './incoming.html',
  styleUrl: './incoming.css',
})

export class IncomingDocumentsPage implements OnInit {

  private docsService = inject(DocumentsService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  documents: DocumentDto[] = [];

  isLoading = false;
  errorMessage = '';

  showModal = false;

  roles: DocumentRole[] = ['Pending', 'Approved', 'Rejected'];

  statusFilter: 'All' | DocumentRole = 'All';
  searchTerm = '';

  selectedFile: File | null = null;

  form = this.fb.nonNullable.group({
    title: this.fb.nonNullable.control('', [Validators.required]),
    description: this.fb.nonNullable.control(''),
    content: this.fb.nonNullable.control(''),
    role: this.fb.nonNullable.control<DocumentRole>('Pending', [Validators.required]),
    createBy: this.fb.nonNullable.control('admin'),
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  get filteredDocuments(): DocumentDto[] {
    const term = this.searchTerm.trim().toLowerCase();
    const status = this.statusFilter;

    return this.documents.filter((d) => {
      const label = this.roleLabel(d.role);
      const matchStatus = status === 'All' || label === status;
      const text = `${d.title ?? ''} ${d.description ?? ''}`.toLowerCase();
      const matchSearch = !term || text.includes(term);
      return matchStatus && matchSearch;
    });
  }

  load(): void {

    this.errorMessage = '';
    this.isLoading = true;

    this.docsService.getAll().subscribe({
      next: (docs) => {
        this.documents = docs ?? [];
        this.isLoading = false;

        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Không tải được danh sách công văn.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

  }

  openModal() {

    this.selectedFile = null;

    this.form.reset({
      title: '',
      description: '',
      content: '',
      role: 'Pending',
      createBy: 'admin',
    });

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  submit() {

  if (this.form.invalid) return;

  const payload = this.form.getRawValue();

  const fd = new FormData();

  fd.append('title', payload.title);
  fd.append('description', payload.description || '');
  fd.append('content', payload.content || '');
  fd.append('role', payload.role.toString());
  fd.append('createBy', payload.createBy);

  if (this.selectedFile) {
    fd.append('file', this.selectedFile);
  }

  this.docsService.createWithFile(fd).subscribe({
    next: () => {
      this.closeModal();
      this.load();
    },
    error: () => {
      this.errorMessage = 'Tạo thất bại';
    },
  });
  console.log(payload);
}

  onFileChange(e: Event) {

    const input = e.target as HTMLInputElement;

    this.selectedFile =
      input.files && input.files.length > 0
        ? input.files[0]
        : null;

  }

  roleLabel(role: DocumentRole | number): DocumentRole {

    if (role === 0) return 'Pending';
    if (role === 1) return 'Approved';
    if (role === 2) return 'Rejected';

    if (
      role === 'Pending' ||
      role === 'Approved' ||
      role === 'Rejected'
    ) return role;

    return 'Pending';

  }

}