import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, RegisterRequest, User } from '../models/models';

const SESSION_STORAGE_KEY = 'valleystore_auth';

interface StoredAuthSession {
  session: AuthResponse;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly session = signal<AuthResponse | null>(this.restoreSession());
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly authenticationVisible = signal(false);

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(session => this.saveSession(session)),
    );
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, request);
  }

  authorizationHeaders(): HttpHeaders {
    const session = this.session();
    if (!session) {
      throw new Error('Authentication is required for this request.');
    }

    return new HttpHeaders({
      Authorization: `${session.tokenType} ${session.token}`,
    });
  }

  openAuthentication(): void {
    this.authenticationVisible.set(true);
  }

  closeAuthentication(): void {
    this.authenticationVisible.set(false);
  }

  logout(): void {
    globalThis.sessionStorage?.removeItem(SESSION_STORAGE_KEY);
    this.session.set(null);
  }

  private saveSession(session: AuthResponse): void {
    const storedSession: StoredAuthSession = {
      session,
      expiresAt: Date.now() + session.expiresInSeconds * 1000,
    };
    try {
      globalThis.sessionStorage?.setItem(SESSION_STORAGE_KEY, JSON.stringify(storedSession));
    } catch {
      throw new Error('Unable to save your sign-in session in this browser.');
    }
    this.session.set(session);
  }

  private restoreSession(): AuthResponse | null {
    try {
      const saved = globalThis.sessionStorage?.getItem(SESSION_STORAGE_KEY);
      if (!saved) return null;

      const stored = JSON.parse(saved) as StoredAuthSession;
      const session = stored.session;
      if (!session?.token || !session.tokenType || !session.user?.email || stored.expiresAt <= Date.now()) {
        globalThis.sessionStorage?.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }
}
