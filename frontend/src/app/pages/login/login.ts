import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  isSubmitting = false;
  errorMessage = '';

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {

    if (this.loginForm.invalid) return;

    this.errorMessage = '';
    this.isSubmitting = true;

    const username = (this.loginForm.value.username ?? '').trim();
    const password = this.loginForm.value.password ?? '';

    this.auth.login(username, password).subscribe({

      next: (res: any) => {

        console.log("LOGIN RESPONSE:", res);

        const token = res?.token;
        const user = res?.user;

        if (token) {
          localStorage.setItem('token', token);
          this.auth.saveToken(token);
        }

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));

          const role = user.role;

          // 👇 xử lý role
          if (role === 'Admin' || role === 0) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      },

      error: (err) => {
        this.errorMessage =
          err?.status === 401
            ? 'Sai tài khoản hoặc mật khẩu.'
            : 'Không thể đăng nhập. Vui lòng thử lại.';

        this.isSubmitting = false;
      },

      complete: () => {
        this.isSubmitting = false;
      }

    });
  }
}