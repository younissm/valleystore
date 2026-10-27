import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="auth-page">
      <button class="close" type="button" (click)="close.emit()" [attr.aria-label]="languageService.t('close')">×</button>
      <span class="eyebrow">{{ languageService.t('account') }}</span>
      <h1>{{ languageService.t(mode === 'login' ? 'signInTitle' : 'signUpTitle') }}</h1>
      <p class="intro">{{ languageService.t(mode === 'login' ? 'signInDescription' : 'signUpDescription') }}</p>

      <div class="tabs" role="tablist" [attr.aria-label]="languageService.t('account')">
        <button type="button" role="tab" [attr.aria-selected]="mode === 'login'" [class.active]="mode === 'login'" (click)="setMode('login')">{{ languageService.t('signIn') }}</button>
        <button type="button" role="tab" [attr.aria-selected]="mode === 'register'" [class.active]="mode === 'register'" (click)="setMode('register')">{{ languageService.t('signUp') }}</button>
      </div>

      @if (message) { <p class="message" role="status">{{ message }}</p> }
      @if (error) { <p class="error" role="alert">{{ error }}</p> }

      <form #authForm="ngForm" (ngSubmit)="submit()">
        @if (mode === 'register') {
          <div class="name-fields">
            <label>{{ languageService.t('firstName') }}
              <input name="firstName" [(ngModel)]="firstName" required maxlength="100" autocomplete="given-name">
            </label>
            <label>{{ languageService.t('lastName') }}
              <input name="lastName" [(ngModel)]="lastName" required maxlength="100" autocomplete="family-name">
            </label>
          </div>
        }

        <label>{{ languageService.t('email') }}
          <input type="email" name="email" [(ngModel)]="email" required maxlength="255" autocomplete="email">
        </label>
        <label>{{ languageService.t('password') }}
          <input type="password" name="password" [(ngModel)]="password" required [minlength]="mode === 'register' ? 8 : 1" [maxlength]="mode === 'register' ? 72 : 255" [autocomplete]="mode === 'login' ? 'current-password' : 'new-password'">
        </label>
        @if (mode === 'register') {
          <label>{{ languageService.t('phoneOptional') }}
            <input type="tel" name="phone" [(ngModel)]="phone" maxlength="20" autocomplete="tel">
          </label>
        }

        <button class="submit" type="submit" [disabled]="authForm.invalid || submitting">
          {{ submitting ? languageService.t('pleaseWait') : languageService.t(mode === 'login' ? 'signIn' : 'createAccount') }}
        </button>
      </form>
    </section>
  `,
  styles: [`
    :host{display:block;color:#293a2e}.auth-page{position:relative;width:min(460px,100%);margin:2rem auto;padding:clamp(1.5rem,5vw,3rem);background:#f7f7f1}.close{position:absolute;top:1rem;right:1rem;border:0;background:transparent;color:#687168;font-size:1.6rem;cursor:pointer}.eyebrow{color:#7c887b;font-size:.67rem;font-weight:750;letter-spacing:.15em}.auth-page h1{margin:.65rem 0;font:400 2.4rem Georgia,serif}.intro{margin:0 0 1.5rem;color:#798278;font-size:.85rem;line-height:1.6}.tabs{display:grid;grid-template-columns:1fr 1fr;margin-bottom:1.4rem;border-bottom:1px solid #dfe3da}.tabs button{padding:.75rem;border:0;border-bottom:2px solid transparent;background:transparent;color:#798278;cursor:pointer}.tabs button.active{border-bottom-color:#315c40;color:#315c40;font-weight:700}.auth-page form,.name-fields{display:grid;gap:.9rem}.name-fields{grid-template-columns:1fr 1fr}.auth-page label{display:grid;gap:.4rem;color:#59665a;font-size:.75rem;font-weight:700}.auth-page input{width:100%;padding:.75rem;border:1px solid #e0e3dc;background:#fff;color:#39453b;font:inherit;font-size:.85rem}.submit{margin-top:.4rem;padding:.9rem;border:0;background:#315c40;color:#fff;font-weight:700;cursor:pointer}.submit:disabled{opacity:.55;cursor:not-allowed}.error{color:#a63d32;font-size:.8rem;line-height:1.5}.message{color:#315c40;font-size:.8rem;line-height:1.5}@media(max-width:480px){.name-fields{grid-template-columns:1fr}}
  `],
})
export class AuthComponent {
  @Output() readonly close = new EventEmitter<void>();

  readonly authService = inject(AuthService);
  readonly languageService = inject(LanguageService);
  mode: 'login' | 'register' = 'login';
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  phone = '';
  submitting = false;
  error = '';
  message = '';

  setMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.password = '';
    this.error = '';
    this.message = '';
  }

  submit(): void {
    this.error = '';
    this.message = '';
    this.submitting = true;

    if (this.mode === 'register') {
      this.authService.register({
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim(),
        password: this.password,
        ...(this.phone.trim() ? { phone: this.phone.trim() } : {}),
      }).subscribe({
        next: () => {
          this.submitting = false;
          this.password = '';
          this.setMode('login');
          this.message = this.languageService.t('registrationSuccess');
        },
        error: err => this.handleError(err),
      });
      return;
    }

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.submitting = false;
        this.close.emit();
      },
      error: err => this.handleError(err),
    });
  }

  private handleError(error: HttpErrorResponse | Error): void {
    this.submitting = false;
    if (error instanceof HttpErrorResponse) {
      this.error = error.error?.detail || error.error?.message || this.languageService.t('authFailed');
      return;
    }
    this.error = error.message || this.languageService.t('authFailed');
  }
}
