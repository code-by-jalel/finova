import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services';
import { User } from '../../../core/models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() open = true;
  currentUser: User | null = null;

  constructor(private router: Router, private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  isTreasurer(): boolean {
    return this.currentUser ? this.currentUser.role === 'treasurer' : false;
  }

  isAdmin(): boolean {
    return this.currentUser ? this.currentUser.role === 'admin' : false;
  }
}

