import { Injectable, signal } from '@angular/core';

export interface AuthUser {
    idUser: string;
    firstName: string;
    surName: string;
    email: string;
    role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly TOKEN_KEY = 'medicita_token';
    private readonly USER_KEY = 'medicita_user';

    currentUser = signal<AuthUser | null>(this.loadUser());

    setSession(token: string, user: AuthUser): void {
        sessionStorage.setItem(this.TOKEN_KEY, token);
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
    }

    getToken(): string | null {
        return sessionStorage.getItem(this.TOKEN_KEY);
    }

    private loadUser(): AuthUser | null {
        const raw = sessionStorage.getItem(this.USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    isAdmin(): boolean {
        return this.currentUser()?.role === 'Administrador';
    }

    isPatient(): boolean {
        return this.currentUser()?.role === 'Paciente';
    }

    logout(): void {
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
        this.currentUser.set(null);
    }
}
