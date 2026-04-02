import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentsService, DocumentDto, DocumentRole } from '../../../services/documents';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './document-list.html',
  styleUrl: './document-list.css',
})
export class DocumentList implements OnInit {
  private documentsService = inject(DocumentsService);

  documents: DocumentDto[] = [];
  isLoading = false;
  errorMessage = '';

  roles: DocumentRole[] = ['Pending', 'Approved', 'Rejected'];
  roleFilter: DocumentRole | 'All' = 'All';

  ngOnInit(): void {
    this.load();
  }

  get filtered(): DocumentDto[] {
    if (this.roleFilter === 'All') return this.documents;
    return this.documents.filter((d) => d.role === this.roleFilter);
  }

  load(): void {
    this.errorMessage = '';
    this.isLoading = true;
    this.documentsService.getAll().subscribe({
      next: (docs) => {
        this.documents = docs ?? [];
      },
      error: () => {
        this.errorMessage = 'Không tải được danh sách công văn.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  delete(doc: DocumentDto): void {
    const ok = confirm(`Xoá công văn "${doc.title}"?`);
    if (!ok) return;

    this.documentsService.delete(doc.id).subscribe({
      next: () => {
        this.documents = this.documents.filter((d) => d.id !== doc.id);
      },
      error: () => {
        alert('Xoá thất bại. Vui lòng thử lại.');
      },
    });
  }
}
