import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsPage {

  isDark = false;

ngOnInit() {
  const theme = localStorage.getItem('theme');

  if (theme === 'dark') {
    this.isDark = true;
    document.documentElement.classList.add('dark');
  }
}

toggleDarkMode(event: any) {
  this.isDark = event.target.checked;

  const html = document.documentElement;

  if (this.isDark) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}
}

