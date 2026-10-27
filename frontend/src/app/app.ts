import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService } from './core/services/cart.service';
import { AuthComponent } from './features/auth/auth.component';
import { AuthService } from './core/services/auth.service';
import { LanguageService } from './core/services/language.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AuthComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = 'Valleystore';
  protected readonly cartService = inject(CartService);
  protected readonly authService = inject(AuthService);
  protected readonly languageService = inject(LanguageService);
  protected authenticationError = '';

  protected setLanguage(language: string): void {
    this.languageService.setLanguage(language);
  }

  protected signOut(): void {
    try {
      this.authService.logout();
      this.authenticationError = '';
    } catch {
      this.authenticationError = this.languageService.t('signOutFailed');
    }
  }
}
