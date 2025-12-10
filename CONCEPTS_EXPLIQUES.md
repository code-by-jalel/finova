# 📖 Finova - Concepts Expliqués

## 1. Services (Couche Métier)

### Qu'est-ce que c'est ?
Un **service** = classe réutilisable qui contient la logique métier (CRUD, calculs, etc.)

### Exemple: AuthService
```typescript
export class AuthService {
  login(email, password) {
    // Valide les credentials
    // Génère un token
    // Stocke en localStorage
    // Retourne un Observable<User>
  }
}
```

### Utilisation dans les composants
```typescript
constructor(private authService: AuthService) {}

onLogin() {
  this.authService.login(email, password).subscribe(user => {
    console.log('Connecté:', user);
  });
}
```

### Avantages
- ✅ Réutilisable dans plusieurs composants
- ✅ Testable indépendamment
- ✅ Logique centralisée (modification en un seul endroit)

---

## 2. Guards (Protection des Routes)

### Qu'est-ce que c'est ?
Un **guard** = fonction qui vérifie des conditions avant d'autoriser l'accès à une route

### Exemple: AuthGuard
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;  // ✅ Accès autorisé
    }
    this.router.navigate(['/auth/login']);  // ❌ Redirection
    return false;
  }
}
```

### Utilisation dans le routing
```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]  // ← Protected!
  }
];
```

### Cas d'usage
- **AuthGuard** : Utilisateur connecté ?
- **AdminGuard** : Utilisateur admin ?
- **RoleGuard** : Utilisateur a le bon rôle ?

---

## 3. Observables & RxJS (Réactivité)

### Qu'est-ce que c'est ?
Un **Observable** = flux de données asynchrone (comme une rivière de données)

### Exemple: currentUser$ (BehaviorSubject)
```typescript
// Dans AuthService
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();

// S'abonner au flux
this.authService.currentUser$.subscribe(user => {
  console.log('Utilisateur changé:', user);  // Notifié automatiquement
});
```

### Opérateurs RxJS utiles
```typescript
// map : transformer les données
this.http.get(...).pipe(
  map(users => users.filter(u => u.role === 'admin'))
)

// takeUntil : arrêter la souscription
private destroy$ = new Subject<void>();
this.authService.currentUser$
  .pipe(takeUntil(this.destroy$))
  .subscribe(...)

ngOnDestroy() {
  this.destroy$.next();  // Arrête les souscriptions
}
```

### Avantages
- ✅ Données en temps réel
- ✅ Prévient les memory leaks
- ✅ Chaînage d'opérations

---

## 4. Modèles (TypeScript Interfaces)

### Qu'est-ce que c'est ?
Une **interface** = contrat TypeScript qui définit la structure des données

### Exemple: User Interface
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}
```

### Utilisation
```typescript
const user: User = {
  id: '1',
  email: 'test@finova.fr',
  name: 'Test User',
  role: 'user'
};

// ✅ TypeScript vérifie les types
const name: string = user.name;  // OK
const role: 'admin' = user.role;  // ❌ Erreur si role = 'user'
```

### Avantages
- ✅ Autocomplétion dans l'IDE
- ✅ Erreurs détectées à la compilation
- ✅ Documentation du code

---

## 5. Composants (UI Layer)

### Qu'est-ce que c'est ?
Un **composant** = classe TypeScript + template HTML + styles CSS

### Structure d'un composant
```typescript
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    // Initialisation
  }
  
  onSubmit() {
    // Logique du composant
  }
}
```

### Cycle de vie (Lifecycle Hooks)
```typescript
ngOnInit()      // Après création du composant
ngOnDestroy()   // Avant destruction (cleanup)
ngOnChange()    // Quand @Input change
```

---

## 6. Modules (NgModule)

### Qu'est-ce que c'est ?
Un **module** = groupe de composants, services et pipes liés

### Exemple: BudgetsModule
```typescript
@NgModule({
  declarations: [
    BudgetListComponent,
    BudgetFormComponent,
    BudgetDetailComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BudgetsRoutingModule
  ]
})
export class BudgetsModule {}
```

### Lazy Loading (Chargement à la demande)
```typescript
// Dans app-routing.module.ts
const routes: Routes = [
  {
    path: 'budgets',
    loadChildren: () => import('./modules/budgets/budgets.module')
      .then(m => m.BudgetsModule)
  }
];
```

### Avantages
- ✅ Code splitté (plus rapide au démarrage)
- ✅ Code chargé uniquement quand nécessaire
- ✅ Organisation logique

---

## 7. Reactive Forms (Gestion Formulaires)

### Qu'est-ce que c'est ?
Une **Reactive Form** = formulaire contrôlé par TypeScript (plutôt que le template)

### Exemple: LoginComponent
```typescript
this.loginForm = this.formBuilder.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]]
});

// Dans le template
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <input formControlName="email">
  <input formControlName="password">
  <button type="submit" [disabled]="loginForm.invalid">
    Connexion
  </button>
</form>
```

### Avantages
- ✅ Validation réactive
- ✅ Accès facile aux valeurs
- ✅ Pas de deux-way binding

---

## 8. Dependency Injection (DI)

### Qu'est-ce que c'est ?
**DI** = Angular injecte automatiquement les dépendances dans les constructeurs

### Exemple
```typescript
// Au lieu de créer manuellement:
// const service = new AuthService();

// Angular injecte automatiquement:
export class LoginComponent {
  constructor(private authService: AuthService) {
    // authService est prêt à utiliser
  }
}
```

### Avantages
- ✅ Service unique (singleton)
- ✅ Testable facilement
- ✅ Découplage

---

## 9. HTTP & JSON-Server

### Qu'est-ce que c'est ?
**HTTP** = communication client-serveur via des requêtes GET, POST, PATCH, DELETE

### Exemple: TransactionService
```typescript
getAll(): Observable<Transaction[]> {
  return this.http.get<Transaction[]>(
    'http://localhost:3000/transactions?userId=1'
  );
}

create(data: Transaction): Observable<Transaction> {
  return this.http.post<Transaction>(
    'http://localhost:3000/transactions',
    data
  );
}
```

### JSON-Server
- ✅ API fake locale (pas de vrai serveur)
- ✅ Stockage en db.json
- ✅ Endpoints REST automatiques (CRUD)

---

## 10. Authentification & Tokens

### Flux de connexion
```
1. Utilisateur entre email/password
   ↓
2. AuthService envoie POST /users?email=X
   ↓
3. JSON-Server retourne l'utilisateur si credentials OK
   ↓
4. AuthService génère un token: 'token_' + userId + timestamp
   ↓
5. Token stocké en localStorage
   ↓
6. currentUser$ notifie tous les abonnés
   ↓
7. AppComponent affiche le layout
```

### Logout
```typescript
logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUserSubject.next(null);  // Notifie tous les abonnés
}
```

---

## 11. Rôles d'Utilisateurs

### Exemple
```typescript
// Utilisateur normal
{
  id: '1',
  email: 'test@finova.fr',
  role: 'user'  // ← Accès limité
}

// Admin
{
  id: '2',
  email: 'admin@finova.fr',
  role: 'admin'  // ← Accès complet + /admin
}
```

### AdminGuard
```typescript
canActivate(): boolean {
  const user = this.authService.getCurrentUser();
  if (user && user.role === 'admin') {
    return true;  // ✅ Admin autorisé
  }
  this.router.navigate(['/dashboard']);  // ❌ User redirigé
  return false;
}
```

---

## 12. Architecture Globale

### Flux complet
```
User interactions (click, input)
         ↓
Composants (UI)
         ↓
Services (Logique métier)
         ↓
HTTP Client (Requêtes API)
         ↓
JSON-Server (db.json)
         ↓
Réponse HTTP
         ↓
Observable retournée
         ↓
Composant subscribe() et affiche
```

### Principes
- 🔹 **Séparation des responsabilités** : Services ≠ Composants
- 🔹 **Réactivité** : Observables pour les données temps réel
- 🔹 **Protection** : Guards pour les routes sensibles
- 🔹 **Réutilisabilité** : Services utilisés par plusieurs composants
- 🔹 **Maintenabilité** : Structure modulaire + lazy loading

---

## Résumé en 1 phrase

**Finova = Service métier (CRUD) → Composants UI (Reactive Forms) → Routes protégées (Guards) → Données temps réel (Observables)**

🎯 Fin!
