import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type DocumentRole = 'Pending' | 'Approved' | 'Rejected';

export interface DocumentDto {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;

  role: number | DocumentRole;

  attachmentFileName?: string | null;
  attachmentUrl?: string | null;

  createBy?: string | null;
  createAt?: string | null;
  updateAt?: string | null;
  recieveAt?: string | null;
}

export type CreateDocumentDto = Partial<DocumentDto>;
export type UpdateDocumentDto = Partial<DocumentDto>;

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  private readonly apiUrl = `${environment.apiUrl}/document`;

  constructor(private http: HttpClient) {}


  getAll(): Observable<DocumentDto[]> {
    return this.http.get<DocumentDto[]>(this.apiUrl);
  }


  getById(id: string): Observable<DocumentDto> {
    return this.http.get<DocumentDto>(`${this.apiUrl}/${id}`);
  }

  private toFormData(
    doc: CreateDocumentDto | UpdateDocumentDto,
    file?: File | null
  ): FormData {
    const fd = new FormData();
    if (doc.title != null) fd.append('title', String(doc.title));
    if (doc.description != null) fd.append('description', String(doc.description));
    if (doc.content != null) fd.append('content', String(doc.content));
    if (doc.role != null) fd.append('role', String(doc.role));
    if (doc.createBy != null) fd.append('createBy', String(doc.createBy));
    if (file) fd.append('file', file);
    return fd;
  }

  createWithFile(formData: FormData): Observable<DocumentDto> {
    return this.http.post<DocumentDto>(`${this.apiUrl}/with-file`, formData);
  }

  // Backend create endpoint hiện là /with-file (FromForm), nên create luôn dùng FormData
  create(doc: CreateDocumentDto, file?: File | null): Observable<DocumentDto> {
    const fd = this.toFormData(doc, file);
    return this.http.post<DocumentDto>(`${this.apiUrl}/with-file`, fd);
  }

  // Backend update endpoint là FromForm => update phải dùng FormData
  update(id: string, doc: UpdateDocumentDto, file?: File | null): Observable<DocumentDto> {
    const fd = this.toFormData(doc, file);
    return this.http.put<DocumentDto>(`${this.apiUrl}/${id}`, fd);
  }


  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}