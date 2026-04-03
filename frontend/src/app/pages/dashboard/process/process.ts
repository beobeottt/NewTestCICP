import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DocumentsService, DocumentDto, DocumentRole, UpdateDocumentDto } from '../../../services/documents';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-process-documents',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './process.html',
  styleUrls: ['./process.css'],
})
export class ProcessDocumentsPage implements OnInit {

  private fb = inject(FormBuilder);
  private docsService = inject(DocumentsService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  doc: DocumentDto | null = null;
  selectedDocument: DocumentDto | null = null;
  documents: DocumentDto[] = [];

  isLoading = false;
  errorMessage = '';
  docId = '';
  showModal = false;

  roles: DocumentRole[] = ['Pending', 'Approved', 'Rejected'];

  selectedFile: File | null = null;

  statusFilter: 'All' | DocumentRole = 'All';
  searchTerm = '';

  form = this.fb.nonNullable.group({
    title: this.fb.nonNullable.control('', [Validators.required]),
    description: this.fb.nonNullable.control(''),
    content: this.fb.nonNullable.control(''),
    role: this.fb.nonNullable.control<DocumentRole>('Pending', [Validators.required]),
    createBy: this.fb.nonNullable.control('admin'),
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.docId = id;
      this.loadDocument(id);
    } else {
      this.load();
    }
  }

  load(): void {
    this.isLoading = true;

    this.docsService.getAll().subscribe({
      next: (docs) => {
        this.documents = docs ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Không tải được danh sách';
        this.isLoading = false;
      }
    });
  }

  private loadDocument(id: string) {
    this.docsService.getById(id).subscribe({
      next: (d) => {
        this.openModel(d);
      },
      error: () => {
        this.errorMessage = 'Load detail lỗi';
      }
    });
  }

  openModel(doc: DocumentDto): void {
    this.selectedDocument = doc;
    this.selectedFile = null;
    this.showModal = true;

    this.form.patchValue({
      title: doc.title ?? '',
      description: doc.description ?? '',
      content: doc.content ?? '',
      role: this.roleLabel(doc.role),
      createBy: doc.createBy ?? ''
    });
  }

  closeModal() {
    this.showModal = false;
  }

  roleLabel(role: DocumentRole | number): DocumentRole {
    if (role === 0) return 'Pending';
    if (role === 1) return 'Approved';
    if (role === 2) return 'Rejected';
    return role as DocumentRole;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  // ================== DEBUG FORM DATA ==================
  private debugFormData(doc: any, file?: File | null) {
    const fd = new FormData();
    fd.append('title', String(doc.title ?? ''));
    fd.append('description', String(doc.description ?? ''));
    fd.append('content', String(doc.content ?? ''));
    fd.append('role', String(doc.role ?? ''));
    fd.append('createBy', String(doc.createBy ?? ''));
    if (file) fd.append('file', file);

    console.log("====== FORM DATA DEBUG ======");
    for (let pair of fd.entries()) {
      console.log(pair[0], pair[1]);
    }
    console.log("=============================");
  }
  // ====================================================

  updateDocument(): void {
    console.log("CLICK UPDATE");

    if (!this.selectedDocument) {
      console.log("NO DOCUMENT");
      return;
    }

    const raw = this.form.getRawValue();

    const payload: UpdateDocumentDto = {
      title: raw.title,
      description: raw.description,
      content: raw.content,
      role: this.roles.indexOf(raw.role),
      createBy: raw.createBy
    };

    console.log("PAYLOAD:", payload);

    // 🔥 DEBUG DATA TRƯỚC KHI GỬI
    this.debugFormData(payload, this.selectedFile);

    this.docsService.update(
      this.selectedDocument.id,
      payload,
      this.selectedFile
    ).subscribe({
      next: (updated) => {
        console.log("UPDATED RESPONSE:", updated);

        this.documents = this.documents.map(d =>
          d.id === updated.id ? { ...d, ...updated } : d
        );

        this.showModal = false;
        this.selectedFile = null;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("UPDATE ERROR:", err);
      }
    });
  }

  attachmentHref(doc: DocumentDto | null | undefined): string | null {
    const url = doc?.attachmentUrl;
    if (!url) return null;

    if (url.startsWith('http')) return url;

    return `${environment.apiUrl}${url}`;
  }
}