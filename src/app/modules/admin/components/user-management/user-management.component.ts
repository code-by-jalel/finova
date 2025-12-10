import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  pendingUsers: User[] = [];
  activeUsers: User[] = [];
  allUsers: User[] = [];
  currentCompanyId: string | null = null;
  selectedTab: 'pending' | 'active' = 'pending';
  loading = false;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;
  destroy$ = new Subject<void>();

  roles = ['admin', 'treasurer', 'manager', 'accountant', 'viewer'];

  editingUserId: string | null = null;
  editingRole: string = '';

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentCompanyId = this.authService.getCurrentCompanyId();
    if (this.currentCompanyId) {
      this.loadUsers();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    if (!this.currentCompanyId) return;

    this.loading = true;
    this.userService.getUsersByCompany(this.currentCompanyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.allUsers = users;
          this.filterUsers();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.showMessage('Erreur lors du chargement des utilisateurs', 'error');
        }
      });
  }

  filterUsers(): void {
    this.pendingUsers = this.allUsers.filter(u => u.status === 'pending');
    this.activeUsers = this.allUsers.filter(u => u.status === 'active');
  }

  approveUser(userId: string, defaultRole: string = 'viewer'): void {
    const permissions = this.userService.getDefaultPermissions(defaultRole);
    this.loading = true;

    this.userService.approveUser(userId, defaultRole, permissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadUsers();
          this.showMessage('Utilisateur approuvé avec succès', 'success');
        },
        error: () => {
          this.loading = false;
          this.showMessage('Erreur lors de l\'approbation', 'error');
        }
      });
  }

  rejectUser(userId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cet utilisateur?')) {
      return;
    }

    this.loading = true;
    this.userService.rejectUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadUsers();
          this.showMessage('Utilisateur rejeté', 'success');
        },
        error: () => {
          this.loading = false;
          this.showMessage('Erreur lors du rejet', 'error');
        }
      });
  }

  startEditRole(user: User): void {
    this.editingUserId = user.id;
    this.editingRole = user.role;
  }

  cancelEditRole(): void {
    this.editingUserId = null;
    this.editingRole = '';
  }

  saveRole(userId: string): void {
    if (!this.editingRole) return;

    const permissions = this.userService.getDefaultPermissions(this.editingRole);
    this.loading = true;

    this.userService.updateUserRole(userId, this.editingRole, permissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.editingUserId = null;
          this.editingRole = '';
          this.loadUsers();
          this.showMessage('Rôle mis à jour avec succès', 'success');
        },
        error: () => {
          this.loading = false;
          this.showMessage('Erreur lors de la mise à jour', 'error');
        }
      });
  }

  getPermissionsDisplay(user: User): string {
    if (user.permissions.includes('full_access')) {
      return 'Accès complet';
    }
    return user.permissions.length + ' permissions';
  }

  private showMessage(text: string, type: 'success' | 'error'): void {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = null;
      this.messageType = null;
    }, 3000);
  }
}
