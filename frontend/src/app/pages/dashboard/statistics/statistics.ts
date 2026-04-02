import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DocumentsService, DocumentDto } from '../../../services/documents';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class StatisticsPage implements OnInit {
  private docsService = inject(DocumentsService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  total = 0;
  pending = 0;
  approved = 0;
  rejected = 0;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  load(): void {
    this.docsService.getAll().subscribe({
      next: (docs: DocumentDto[]) => {
        const list = docs ?? [];
        this.total = list.length;
        this.pending = list.filter((d) => d.role === 'Pending' || d.role === 0).length;
        this.approved = list.filter((d) => d.role === 'Approved' || d.role === 1).length;
        this.rejected = list.filter((d) => d.role === 'Rejected' || d.role === 2).length;

        this.cdr.detectChanges();
      },
    });
  }
}

