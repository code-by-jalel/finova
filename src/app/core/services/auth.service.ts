import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { User, AuthResponse, Company } from '../models';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private currentCompanySubject = new BehaviorSubject<Company | null>(this.getCompanyFromStorage());
  public currentCompany$ = this.currentCompanySubject.asObservable();
  
  private tokenKey = 'finova_token';
  private userKey = 'finova_user';
  private companyKey = 'finova_company';

  constructor(private http: HttpClient) {}

  // Login: Authentification multi-entreprise
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}`)
      .pipe(
        switchMap(users => {
          const user = users.find(u => u.email === email && u.password === password);
          if (!user) {
            throw new Error('Email ou mot de passe incorrect');
          }
          
          // Récupérer les données de l'entreprise
          return this.http.get<Company>(`${this.apiUrl}/companies/${user.companyId}`).pipe(
            map(company => ({ user, company }))
          );
        }),
        tap(({ user, company }) => {
          const token = 'token_' + user.id + '_' + Date.now();
          this.setToken(token);
          this.setUser(user);
          this.setCompany(company);
          this.currentUserSubject.next(user);
          this.currentCompanySubject.next(company);
        }),
        map(({ user, company }) => ({
          token: localStorage.getItem(this.tokenKey) || '',
          user
        })),
        catchError(error => {
          throw new Error(error.message || 'Erreur d\'authentification');
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.companyKey);
    this.currentUserSubject.next(null);
    this.currentCompanySubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  getCurrentCompanyId(): string | null {
    const company = this.getCurrentCompany();
    return company ? company.id : null;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private setCompany(company: Company): void {
    localStorage.setItem(this.companyKey, JSON.stringify(company));
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  private getCompanyFromStorage(): Company | null {
    const company = localStorage.getItem(this.companyKey);
    return company ? JSON.parse(company) : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentCompany(): Company | null {
    return this.currentCompanySubject.value;
  }

  // Vérifier les permissions
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.permissions.includes(permission) : false;
  }

  // Vérifier si utilisateur est trésorier
  isTreasurer(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'treasurer' : false;
  }

  // Vérifier si utilisateur est admin de l'entreprise
  isCompanyAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'admin' : false;
  }

  // Vérifier si utilisateur peut approuver les transactions
  canApprove(): boolean {
    return this.hasPermission('approve_high');
  }

  // Signup: Créer nouvel utilisateur (pour invite)
  signup(email: string, password: string, name: string, companyId: string, role: string): Observable<AuthResponse> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}`)
      .pipe(
        switchMap(users => {
          if (users.length > 0) {
            throw new Error('Cet email est déjà utilisé');
          }
          
          const newUser: User = {
            id: this.generateUserId(),
            email,
            password,
            name,
            role: role as any,
            companyId,
            permissions: this.getDefaultPermissions(role),
            status: 'active'
          };
          
          return this.http.post<User>(`${this.apiUrl}/users`, newUser);
        }),
        tap(user => {
          const token = 'token_' + user.id + '_' + Date.now();
          this.setToken(token);
          this.setUser(user);
          this.currentUserSubject.next(user);
        }),
        map(user => ({
          token: localStorage.getItem(this.tokenKey) || '',
          user
        })),
        catchError(error => {
          throw new Error(error.message || 'Erreur d\'inscription');
        })
      );
  }

  private getDefaultPermissions(role: string): string[] {
    const permissions: { [key: string]: string[] } = {
      'admin': ['full_access'],
      'treasurer': ['view_all_wallets', 'create_transaction', 'approve_high', 'manage_budgets', 'view_reports'],
      'manager': ['view_own_wallets', 'create_transaction', 'view_reports'],
      'accountant': ['view_all_transactions', 'view_reports', 'export_data'],
      'approver': ['approve_high', 'view_reports'],
      'viewer': ['view_reports']
    };
    return permissions[role] || [];
  }

  private generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
}
