import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService, UserDto, CreateUserDto, UpdateUserDto } from '../../../services/users';

@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-manager.html',
  styleUrl: './user-manager.css',
})
export class UserManagerPage implements OnInit {
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  users: UserDto[] = [];
  isLoading = false;
  errorMessage = '';
  showModal = false;
  
  selectedUserId: string | null = null; 

  roles = ['User', 'Admin'];

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    PasswordHash: ['', [Validators.required, Validators.minLength(6)]],
    role: ['User', [Validators.required]],
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.load();
    }
  }

  load(): void {
    this.errorMessage = '';
    this.isLoading = true;
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users = data ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Lỗi tải dữ liệu';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateModal(): void {
    this.selectedUserId = null;
    this.form.reset({ username: '', PasswordHash: '', role: 'User' });
    
    this.form.controls.PasswordHash.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.controls.PasswordHash.updateValueAndValidity();
    
    this.showModal = true;
  }

  openEditModal(user: UserDto): void {
    this.selectedUserId = user.id.toString(); 
    this.showModal = true;
    this.form.controls.PasswordHash.setValidators([Validators.minLength(6)]);
    this.form.patchValue({
      username: user.username,
      PasswordHash: '',
      role: user.role

    });
    this.form.controls.PasswordHash.updateValueAndValidity();
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUserId = null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();

    if (this.selectedUserId) {

      const updateData: UpdateUserDto = {
        username: rawValue.username,
        PasswordHash: rawValue.PasswordHash,
        role: rawValue.role
      };

      this.usersService.update(this.selectedUserId, updateData).subscribe({
        next: (updated) => {
          this.users = this.users.map(u => u.id.toString() === this.selectedUserId ? updated : u);
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: () => alert('Cập nhật thất bại')
      });
    } else {
      const createData: CreateUserDto = rawValue;
      this.usersService.create(createData).subscribe({
        next: (created) => {
          this.users = [...this.users, created].sort((a, b) => 
            a.username.localeCompare(b.username)
          );
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: () => alert('Tạo mới thất bại')
      });
    }
  }

  delete(user: UserDto): void {
    if (confirm(`Xoá người dùng "${user.username}"?`)) {
      this.usersService.delete(user.id.toString()).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id.toString() !== user.id.toString());
          this.cdr.detectChanges();
        },
        error: () => alert('Xoá thất bại')
      });
    }
  }
}