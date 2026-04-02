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


  create(doc: CreateDocumentDto): Observable<DocumentDto> {
    return this.http.post<DocumentDto>(this.apiUrl, doc);
  }

  createWithFile(formData: FormData): Observable<DocumentDto> {
    return this.http.post<DocumentDto>(`${this.apiUrl}/with-file`, formData);
  }


  update(id: string, doc: UpdateDocumentDto): Observable<DocumentDto> {
    return this.http.put<DocumentDto>(`${this.apiUrl}/${id}`, doc);
  }


  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}