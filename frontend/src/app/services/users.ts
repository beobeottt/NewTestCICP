import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserDto {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updateTime: string;
}

export interface CreateUserDto {
  username: string;
  role: string;
  password: string;
}

export interface UpdateUserDto{
  username: string;
  password: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.apiUrl);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateUserDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}/register`, {
      username: data.username,
      password: data.password,
      role: data.role,
    });
  }

  update(id: string, data: UpdateUserDto): Observable<UserDto>
  {
    return this.http.put<UserDto>(`${this.apiUrl}/${id}`, data);
  }
}


