import { Component } from '@angular/core';
import { Auth } from '../../service/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signin',
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
 username = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  loading = false;
  errorMsg = '';

  constructor(private auth: Auth, private router: Router) {}

  onSubmit() {
    this.errorMsg = '';

    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMsg = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.loading = true;

    this.auth.addUser({
      username: this.username,
      email: this.email,
      password: this.password,
      role: 'user'
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.message || 'Erreur lors de l\'inscription.';
      }
    });
  }
}
