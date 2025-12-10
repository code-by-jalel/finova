import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000';
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Récupérer tous les utilisateurs d'une entreprise
  getUsersByCompany(companyId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?companyId=${companyId}`)
      .pipe(
        tap(users => this.usersSubject.next(users))
      );
  }

  // Récupérer tous les utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`)
      .pipe(
        tap(users => this.usersSubject.next(users))
      );
  }

  // Récupérer un utilisateur par ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  // Approuver un utilisateur (changer status de pending à active)
  approveUser(userId: string, role: string, permissions: string[]): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, {
      status: 'active',
      role,
      permissions
    }).pipe(
      tap(user => {
        const currentUsers = this.usersSubject.getValue();
        const updatedUsers = currentUsers.map(u => u.id === userId ? user : u);
        this.usersSubject.next(updatedUsers);
      })
    );
  }

  // Rejeter un utilisateur (supprimer)
  rejectUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`)
      .pipe(
        tap(() => {
          const currentUsers = this.usersSubject.getValue();
          const updatedUsers = currentUsers.filter(u => u.id !== userId);
          this.usersSubject.next(updatedUsers);
        })
      );
  }

  // Modifier les permissions d'un utilisateur
  updateUserRole(userId: string, role: string, permissions: string[]): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, {
      role,
      permissions
    }).pipe(
      tap(user => {
        const currentUsers = this.usersSubject.getValue();
        const updatedUsers = currentUsers.map(u => u.id === userId ? user : u);
        this.usersSubject.next(updatedUsers);
      })
    );
  }

  // Récupérer les permissions par défaut selon le rôle
  getDefaultPermissions(role: string): string[] {
    const permissions: { [key: string]: string[] } = {
      'admin': ['full_access'],
      'treasurer': ['view_all_wallets', 'create_transaction', 'approve_high', 'manage_budgets', 'view_reports'],
      'manager': ['view_own_wallets', 'create_transaction', 'approve_transactions', 'view_reports'],
      'accountant': ['view_all_transactions', 'view_all_wallets', 'view_all_budgets', 'view_reports', 'export_data'],
      'approver': ['approve_high', 'view_reports'],
      'viewer': ['view_reports']
    };
    return permissions[role] || [];
  }

  // Filtrer les utilisateurs par statut
  getFilteredUsers(companyId: string, status: string): Observable<User[]> {
    return this.getUsersByCompany(companyId).pipe(
      map(users => users.filter(u => u.status === status))
    );
  }
}
