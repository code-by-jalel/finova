import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.authService.getCurrentUser();

    // Admin et Treasurer peuvent accéder à l'administration
    if (user && (user.role === 'admin' || user.role === 'treasurer')) {
      return true;
    }

    // Redirection if not authorized
    this.router.navigate(['/dashboard']);
    return false;
  }
}
