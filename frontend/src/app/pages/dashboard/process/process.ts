import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { DocumentsService, DocumentDto, DocumentRole } from '../../../services/documents';
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
  } 
  else {
    this.load();
  }

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

      error: () =>{
        this.errorMessage = 'can not solve document';
        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });
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

  private loadDocument(id: string) {

    this.isLoading = true;

    this.docsService.getById(id).subscribe({

      next: (d) => {

        this.doc = d;

        this.openModel(d);

        this.isLoading = false;

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error(err);

        this.errorMessage = 'Cannot load document detail';

        this.isLoading = false;

        this.cdr.detectChanges();

      }

    });
  }


  setRole(doc: DocumentDto, role: DocumentRole): void {

    // Backend update expects multipart/form-data, so always use FormData update
    this.docsService.update(
      doc.id,
      {
        title: doc.title ?? '',
        description: doc.description ?? '',
        content: doc.content ?? '',
        role,
        createBy: doc.createBy ?? '',
      },
      null
    ).subscribe({

      next: (updated) => {

        this.documents = this.documents.map((d) =>
          d.id === doc.id ? { ...d, role: updated.role } : d
        );

      },

      error: () => {

        alert('Không thể cập nhật trạng thái.');
        console.log(this.errorMessage);

      },

    });

  }

  roleLabel(role: DocumentRole | number): DocumentRole {

    if (role === 0) return 'Pending';

    if (role === 1) return 'Approved';

    if (role === 2) return 'Rejected';

    if (role === 'Pending' || role === 'Approved' || role === 'Rejected') return role;

    return 'Pending';

  }

  openModel(doc: DocumentDto): void {

    this.selectedFile = null;
    this.doc = doc;
    this.selectedDocument = doc;

    this.showModal = true;

    this.form.patchValue({

      title: doc.title ?? '',

      description: doc.description ?? '',

      content: doc.content ?? '',

      role: this.roleLabel(doc.role),

      createBy: doc.createBy ?? ''

    });
    console.log(doc);

  }

  closeModal(){
    this.showModal = false;
  }

  Delete(document: DocumentDto): void
  {
    if(confirm(`Delete Document "${document.title}"?`))
    {
      this.docsService.delete(document.id.toString()).subscribe({
        next: () => {
          this.documents = this.documents.filter(doc => doc.id.toString() != document.id.toString());
          this.cdr.detectChanges();
        },
        error: () => alert('Delete False')
      });
    }
  }

//   updateDocument(): void {

//   if (!this.selectedDocument) return;

//   const raw = this.form.getRawValue();

//   const data = {
//     id: this.selectedDocument.id,
//     ...raw,
//     role: this.roles.indexOf(raw.role)
//   };


//   console.log("UPDATE DATA =", data);

//   console.log(this.selectedDocument.id);

//   this.docsService.update(this.selectedDocument.id, data).subscribe({
    
//     next: () => {

//       this.showModal = false;

//       this.loadDocument(this.docId);

//     },
//     error: (err) => {

//       console.error("UPDATE ERROR", err);

//       alert("Không thể cập nhật document");

//     }
//   });
//   this.closeModal();
//   this.load();
// }

// updateDocument(): void {

//   if (!this.selectedDocument) return;

//   const raw = this.form.getRawValue();

//   const data = {
//     id: this.selectedDocument.id,
//     ...raw,
//     role: this.roles.indexOf(raw.role)
//   };

//   this.docsService.update(this.selectedDocument.id, data).subscribe({
    
//     next: (updated) => {
//       this.documents = this.documents.map(d =>
//         d.id === this.selectedDocument!.id ? { ...d, ...updated } : d
//       );

//       this.showModal = false;
//       this.selectedFile = null;

//       this.cdr.detectChanges();
//     },

//     error: (err) => {
//       console.error(err);
//       alert("Không thể cập nhật document");
//     }
//   });
// }

updateDocument(): void {
  if (!this.selectedDocument) return;

  const raw = this.form.getRawValue();


  const data: Partial<DocumentDto> = {
    ...this.selectedDocument,  
    title: raw.title,          
    description: raw.description,
    content: raw.content,
    role: this.roles.indexOf(raw.role), 
    createBy: raw.createBy     
  };

  this.docsService.update(this.selectedDocument.id, data, this.selectedFile).subscribe({
    next: (updated) => {
      this.documents = this.documents.map(d =>
        d.id === updated.id ? { ...d, ...updated } : d
      );

      this.showModal = false;
      this.selectedFile = null; 
      this.cdr.detectChanges();

      console.log('Document updated successfully', updated);
    },
    error: (err) => {
      console.error('Update error', err);
      alert('Không thể cập nhật document');
    }
  });
}
  onFileSelected(event: any) {

    const file = event.target.files[0];

    if (file) {

      this.selectedFile = file;

    }

  }

  attachmentHref(doc: DocumentDto | null | undefined): string | null {

    const url = doc?.attachmentUrl;

    if (!url) return null;

    if (url.startsWith('http')) {

      return url;

    }

    const BASE_URL = environment.apiUrl;

    return `${BASE_URL}${url}`;

  }
}