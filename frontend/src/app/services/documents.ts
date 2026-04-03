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
    fd.append('title', String(doc.title ?? ''));
    fd.append('description', String(doc.description ?? ''));
    fd.append('content', String(doc.content ?? ''));
    fd.append('role', String(doc.role ?? 'Pending'));
    fd.append('createBy', String(doc.createBy ?? ''));
    if (file) fd.append('file', file);
    return fd;
  }


  createWithFile(formData: FormData): Observable<DocumentDto> {
    return this.http.post<DocumentDto>(`${this.apiUrl}/with-file`, formData);
  }

  create(doc: CreateDocumentDto, file?: File | null): Observable<DocumentDto> {
    const fd = this.toFormData(doc, file);
    return this.http.post<DocumentDto>(`${this.apiUrl}/with-file`, fd);
  }

  update(id: string, doc: Partial<UpdateDocumentDto>, file?: File | null) {
  let payload: FormData | Partial<UpdateDocumentDto> = doc;

  if (file) {
    payload = this.toFormData(doc, file);
  }

  return this.http.put<DocumentDto>(`${this.apiUrl}/${id}`, payload);
}
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}