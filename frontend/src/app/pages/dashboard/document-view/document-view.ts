import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DocumentsService, DocumentDto, DocumentRole } from '../../../services/documents';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-document-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './document-view.html',
  styleUrls: ['./document-view.css']
})
export class DocumentViewPage implements OnInit {

  private route = inject(ActivatedRoute);
  private docsService = inject(DocumentsService);
  private cdr = inject(ChangeDetectorRef);

  doc: DocumentDto | null = null;
  docId = '';

  isLoading = false;
  errorMessage = '';
  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Không tìm thấy id công văn';
      return;
    }

    this.docId = id;
    this.loadDocument(id);
  }

  private loadDocument(id: string) {

    this.isLoading = true;
    this.docsService.getById(id).subscribe({
      
      next: (d) => {

        this.doc = this.normalizeDto(d);

        this.isLoading = false;

        this.cdr.detectChanges();

        console.log('doc:', this.doc);
      },

      error: (err) => {

        console.error(err);

        this.errorMessage = 'Không tải được chi tiết công văn.';
        this.isLoading = false;

        this.cdr.detectChanges();
      }
    });

  }

  private normalizeDto(d: DocumentDto): DocumentDto {

    return {
      ...d,
      title: d.title ?? '',
      description: d.description ?? '',
      content: d.content ?? '',
      attachmentFileName: d.attachmentFileName ?? null,
      attachmentUrl: d.attachmentUrl ?? null,
      createBy: d.createBy ?? '',
      createAt: d.createAt ?? '',
      updateAt: d.updateAt ?? '',
      recieveAt: d.recieveAt ?? '',
      role: d.role ?? 'Pending'
    };

  }

  roleLabel(role: DocumentRole | number | string | null | undefined): DocumentRole {

    if (role === null || role === undefined) return 'Pending';

    const r = typeof role === 'string' ? role.toLowerCase() : role;

    switch (r) {
      case 0:
      case '0':
      case 'pending':
        return 'Pending';

      case 1:
      case '1':
      case 'approved':
        return 'Approved';

      case 2:
      case '2':
      case 'rejected':
        return 'Rejected';

      default:
        return 'Pending';
    }
  }

  attachmentHref(doc: DocumentDto | null | undefined): string | null {

    const url = doc?.attachmentUrl;

    if (!url) return null;

    if (url.startsWith('http')) {
      return url;
    }

    const BASE_URL = 'http://localhost:5001';

    return `${BASE_URL}${url}`;
  }

}