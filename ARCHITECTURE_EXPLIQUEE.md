# 📚 Architecture du Projet Finova - Guide Complet

## 🏗️ Vue d'ensemble

Finova est une application financière Angular 16 basée sur une **architecture modulaire** avec lazy loading et gestion d'état réactive.

```
┌─────────────────────────────────────────────────────────────┐
│                     AppComponent (Root)                      │
│        - Affiche layout si authentifié, sinon login         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    LayoutComponent                           │
│    - Navbar (header avec logo, logout)                      │
│    - Sidebar (navigation menu)                              │
│    - Router-outlet (contenu principal)                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
         ┌──────────────────┬──────────────────┐
         ↓                  ↓                  ↓
    Auth Module      Feature Modules    Admin Module
   (Login page)    (Dashboard, Trans,   (Suppliers)
                    Budgets)
```

---

## 📁 Structure des Dossiers

```
src/app/
│
├── 📂 core/                           # Services, guards, modèles
│   ├── models/
│   │   └── index.ts                  # Interfaces TypeScript
│   ├── services/
│   │   ├── auth.service.ts           # Authentification
│   │   ├── transaction.service.ts    # Gestion transactions
│   │   ├── budget.service.ts         # Gestion budgets
│   │   ├── supplier.service.ts       # Gestion fournisseurs
│   │   └── dashboard.service.ts      # Calculs KPIs
│   └── guards/
│       └── auth.guard.ts             # Protection des routes
│
├── 📂 modules/                        # Modules métier (lazy-loaded)
│   ├── auth/
│   │   ├── login/
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   └── login.component.css
│   │   ├── auth.module.ts
│   │   └── auth-routing.module.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   └── dashboard/
│   │   ├── dashboard.module.ts
│   │   └── dashboard-routing.module.ts
│   │
│   ├── transactions/
│   │   ├── components/
│   │   │   ├── transaction-list/
│   │   │   ├── transaction-form/
│   │   │   └── transaction-detail/
│   │   ├── transactions.module.ts
│   │   └── transactions-routing.module.ts
│   │
│   ├── budgets/
│   │   ├── components/
│   │   │   ├── budget-list/
│   │   │   ├── budget-form/
│   │   │   └── budget-detail/
│   │   ├── budgets.module.ts
│   │   └── budgets-routing.module.ts
│   │
│   ├── admin/
│   │   ├── components/
│   │   │   ├── supplier-list/
│   │   │   ├── supplier-form/
│   │   │   └── supplier-detail/
│   │   ├── admin.module.ts
│   │   └── admin-routing.module.ts
│   │
│   └── layout/
│       ├── components/
│       │   ├── navbar/
│       │   └── sidebar/
│       ├── layout.component.ts
│       ├── layout.module.ts
│       └── layout-routing.module.ts
│
├── 📂 shared/                        # Composants partagés
│   └── components/
│
├── app.component.ts                 # Racine (affiche layout/login)
├── app.component.html               # Template racine
├── app.module.ts                    # Module principal
└── app-routing.module.ts            # Routing principal
```

---

## 🔐 Authentification (AuthService)

### Fichier: `core/services/auth.service.ts`

```typescript
export class AuthService {
  // Données stockées en localStorage
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Login: valide l'email/password et génère un token
  login(email: string, password: string): Observable<AuthResponse> {
    // Simule un appel API (1 seconde de délai)
    // Stocke token et user en localStorage
    // Retourne un Observable
  }

  // Logout: efface les données
  logout(): void {
    localStorage.removeItem('finova_token');
    localStorage.removeItem('finova_user');
    this.currentUserSubject.next(null);
  }

  // Vérification de l'authentification
  isAuthenticated(): boolean {
    return !!localStorage.getItem('finova_token');
  }

  // Récupération du token
  getToken(): string | null {
    return localStorage.getItem('finova_token');
  }
}
```

### Flux d'authentification:
1. Utilisateur entre email/password dans LoginComponent
2. Appel `authService.login(email, password)`
3. AuthService stocke token en localStorage
4. AuthService met à jour `currentUser$` (BehaviorSubject)
5. AppComponent s'abonne à `currentUser$` et affiche layout ou login
6. AuthGuard protège les routes (vérifie `isAuthenticated()`)

---

## 🛡️ AuthGuard (Protection des Routes)

### Fichier: `core/guards/auth.guard.ts`

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Si authentifié: autorise l'accès
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Sinon: redirige vers login
    this.router.navigate(['/auth/login']);
    return false;
  }
}
```

### Utilisation dans le routing:
```typescript
{
  path: '',
  component: LayoutComponent,
  canActivate: [AuthGuard],  // ← Protège cette route
  children: [
    { path: 'dashboard', loadChildren: ... },
    { path: 'transactions', loadChildren: ... }
  ]
}
```

---

## 🗂️ Modèles de Données (Interfaces)

### Fichier: `core/models/index.ts`

```typescript
// Utilisateur
interface User {
  id: string;
  email: string;
  name: string;
}

// Transaction (revenu ou dépense)
interface Transaction {
  id: string;
  type: 'income' | 'expense';           // Revenu ou dépense
  amount: number;                        // Montant
  category: TransactionCategory;         // Catégorie
  description: string;                   // Description
  date: Date;                            // Date
}

type TransactionCategory = 
  | 'Salaire' 
  | 'Abonnements' 
  | 'Achats' 
  | 'Transport' 
  | 'Maintenance' 
  | 'Autre';

// Budget mensuel
interface Budget {
  id: string;
  category: TransactionCategory;
  month: string;              // Format: "2025-12"
  limit: number;              // Limite de dépense
}

// Fournisseur
interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  companyNumber: string;
}

// Données du dashboard
interface DashboardData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  growthPercentage: number;
  monthlyExpenses: Array<{ month: string; amount: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
  monthlyIncome: Array<{ month: string; amount: number }>;
  alerts: Alert[];
  biggestExpenseMonth: string;
}
```

---

## 💾 Services Métier

### 1️⃣ TransactionService

**Fichier:** `core/services/transaction.service.ts`

```typescript
export class TransactionService {
  // Données en mémoire + localStorage
  private transactions: Transaction[] = [];

  // CRUD - Create
  create(transaction: Omit<Transaction, 'id'>): Transaction {
    const newTransaction = {
      ...transaction,
      id: this.generateId()
    };
    this.transactions.push(newTransaction);
    this.saveToLocalStorage();
    return newTransaction;
  }

  // CRUD - Read
  getAll(): Transaction[] {
    return [...this.transactions];
  }

  getById(id: string): Transaction | undefined {
    return this.transactions.find(t => t.id === id);
  }

  // CRUD - Update
  update(id: string, updates: Partial<Transaction>): void {
    const transaction = this.transactions.find(t => t.id === id);
    if (transaction) {
      Object.assign(transaction, updates);
      this.saveToLocalStorage();
    }
  }

  // CRUD - Delete
  delete(id: string): void {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.saveToLocalStorage();
  }

  // Recherche
  search(query: string): Transaction[] {
    return this.transactions.filter(t =>
      t.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Filtres
  filterByType(type: 'income' | 'expense'): Transaction[] {
    return this.transactions.filter(t => t.type === type);
  }

  filterByCategory(category: TransactionCategory): Transaction[] {
    return this.transactions.filter(t => t.category === category);
  }

  filterByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.transactions.filter(t =>
      t.date >= startDate && t.date <= endDate
    );
  }

  // Persistance localStorage
  private saveToLocalStorage(): void {
    localStorage.setItem('finova_transactions', JSON.stringify(this.transactions));
  }

  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('finova_transactions');
    this.transactions = data ? JSON.parse(data) : [...SAMPLE_TRANSACTIONS];
  }
}
```

### 2️⃣ BudgetService

```typescript
export class BudgetService {
  private budgets: Budget[] = [];

  // Vérifie si le budget est dépassé
  isExceeded(budgetId: string): boolean {
    const budget = this.getById(budgetId);
    return this.getUtilizationPercentage(budgetId) > 100;
  }

  // Calcule le pourcentage d'utilisation
  getUtilizationPercentage(budgetId: string): number {
    const budget = this.getById(budgetId);
    if (!budget) return 0;

    // Somme des dépenses de cette catégorie ce mois-ci
    const spent = this.transactionService
      .filterByCategory(budget.category)
      .filter(t => t.type === 'expense')
      .filter(t => t.date.toISOString().substring(0, 7) === budget.month)
      .reduce((sum, t) => sum + t.amount, 0);

    // Pourcentage = (dépensé / limite) * 100
    return (spent / budget.limit) * 100;
  }

  // ... autres méthodes CRUD
}
```

### 3️⃣ DashboardService

```typescript
export class DashboardService {
  getDashboardData(): DashboardData {
    // Calcule tous les KPIs
    const transactions = this.transactionService.getAll();

    // Total balance = revenus - dépenses
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpenses;

    // Croissance (pourcentage change)
    const growth = totalIncome > 0 ? ((totalBalance / totalIncome) * 100) : 0;

    // Dépenses par mois
    const monthlyExpenses = this.groupByMonth(
      transactions.filter(t => t.type === 'expense')
    );

    // Dépenses par catégorie
    const expensesByCategory = this.groupByCategory(
      transactions.filter(t => t.type === 'expense')
    );

    // Revenus par mois
    const monthlyIncome = this.groupByMonth(
      transactions.filter(t => t.type === 'income')
    );

    // Alertes
    const alerts = this.generateAlerts(transactions);

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      growthPercentage: growth,
      monthlyExpenses,
      expensesByCategory,
      monthlyIncome,
      alerts,
      biggestExpenseMonth: this.findBiggestExpenseMonth(monthlyExpenses)
    };
  }

  // Génère les alertes
  private generateAlerts(transactions: Transaction[]): Alert[] {
    const alerts: Alert[] = [];

    // Alerte: Budget dépassé
    const exceededBudgets = this.budgetService.getAll()
      .filter(b => this.budgetService.isExceeded(b.id));

    exceededBudgets.forEach(budget => {
      alerts.push({
        message: `Budget ${budget.category} dépassé`,
        severity: 'danger',
        date: new Date()
      });
    });

    return alerts;
  }
}
```

---

## 🖥️ Composants

### 1️⃣ LoginComponent

**Fichier:** `modules/auth/components/login/login.component.ts`

```typescript
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Créer le formulaire réactif
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onLogin(): void {
    this.submitted = true;

    // Valider le formulaire
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    // Appeler le service de login
    this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe(
        (response) => {
          // Succès: rediriger vers dashboard
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          // Erreur: afficher message
          this.error = 'Email ou mot de passe incorrect';
          this.loading = false;
        }
      );
  }
}
```

**Template:** `modules/auth/components/login/login.component.html`

```html
<div class="login-container">
  <div class="login-card">
    <h1>🏦 Finova</h1>
    <p>Gérez vos finances simplement</p>

    <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
      <!-- Email -->
      <div class="form-group">
        <label>Email</label>
        <input 
          type="email" 
          formControlName="email"
          [class.is-invalid]="submitted && f['email'].errors"
        />
        <span *ngIf="submitted && f['email'].errors" class="error">
          Email invalide
        </span>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label>Mot de passe</label>
        <input 
          type="password" 
          formControlName="password"
          [class.is-invalid]="submitted && f['password'].errors"
        />
        <span *ngIf="submitted && f['password'].errors" class="error">
          Minimum 6 caractères
        </span>
      </div>

      <!-- Error message -->
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <!-- Submit button -->
      <button type="submit" [disabled]="loading">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>

    <!-- Hint -->
    <p class="hint">
      💡 Essayez: test@finova.fr / password123
    </p>
  </div>
</div>
```

### 2️⃣ TransactionListComponent

```typescript
export class TransactionListComponent implements OnInit {
  Math = Math;  // Permet d'utiliser Math dans le template
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  
  // Filtres et pagination
  searchQuery = '';
  filterType: 'all' | 'income' | 'expense' = 'all';
  filterCategory: TransactionCategory | 'all' = 'all';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  // Charge les transactions et applique les filtres
  loadTransactions(): void {
    this.transactions = this.transactionService.getAll();
    this.applyFilters();
  }

  // Applique tous les filtres
  applyFilters(): void {
    let filtered = [...this.transactions];

    // Filtre par type
    if (this.filterType !== 'all') {
      filtered = filtered.filter(t => t.type === this.filterType);
    }

    // Filtre par catégorie
    if (this.filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === this.filterCategory);
    }

    // Recherche par description
    if (this.searchQuery.trim()) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    this.totalItems = filtered.length;
    this.currentPage = 1; // Réinitialise la pagination

    // Pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredTransactions = filtered.slice(startIndex, startIndex + this.pageSize);
  }

  // Aller à la page suivante
  nextPage(): void {
    if (this.currentPage < Math.ceil(this.totalItems / this.pageSize)) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  // Aller à la page précédente
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  // Naviguer vers le détail
  viewDetail(id: string): void {
    this.router.navigate(['/transactions', id]);
  }

  // Naviguer vers l'édition
  editTransaction(id: string): void {
    this.router.navigate(['/transactions', id, 'edit']);
  }

  // Supprimer une transaction
  deleteTransaction(id: string): void {
    if (confirm('Êtes-vous sûr?')) {
      this.transactionService.delete(id);
      this.loadTransactions();
    }
  }
}
```

### 3️⃣ DashboardComponent (avec Charts)

```typescript
export class DashboardComponent implements OnInit {
  Math = Math;
  dashboardData: DashboardData | null = null;
  loading = true;

  // Configurations Chart.js
  monthlyExpensesChart!: ChartConfiguration;
  expensesByCategoryChart!: ChartConfiguration;
  monthlyIncomeChart!: ChartConfiguration;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Récupère les données agrégées
    this.dashboardData = this.dashboardService.getDashboardData();
    this.initializeCharts();
    this.loading = false;
  }

  // Initialise les graphiques Chart.js
  initializeCharts(): void {
    if (!this.dashboardData) return;

    // 📊 Graphique 1: Dépenses mensuelles (ligne)
    this.monthlyExpensesChart = {
      type: 'line',
      data: {
        labels: this.dashboardData.monthlyExpenses.map(m => m.month),
        datasets: [{
          label: 'Dépenses mensuelles',
          data: this.dashboardData.monthlyExpenses.map(m => m.amount),
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    };

    // 🍩 Graphique 2: Dépenses par catégorie (doughnut)
    this.expensesByCategoryChart = {
      type: 'doughnut',
      data: {
        labels: this.dashboardData.expensesByCategory.map(c => c.category),
        datasets: [{
          label: 'Dépenses par catégorie',
          data: this.dashboardData.expensesByCategory.map(c => c.amount),
          backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
        }]
      }
    };

    // 📊 Graphique 3: Revenus mensuels (barres)
    this.monthlyIncomeChart = {
      type: 'bar',
      data: {
        labels: this.dashboardData.monthlyIncome.map(m => m.month),
        datasets: [{
          label: 'Revenus mensuels',
          data: this.dashboardData.monthlyIncome.map(m => m.amount),
          backgroundColor: '#28a745'
        }]
      }
    };
  }

  getGrowthIcon(): string {
    return (this.dashboardData?.growthPercentage || 0) >= 0 ? '📈' : '📉';
  }

  getGrowthColor(): string {
    return (this.dashboardData?.growthPercentage || 0) >= 0 ? 'success' : 'danger';
  }
}
```

---

## 🛣️ Routing (Navigation)

### Fichier: `app-routing.module.ts`

```typescript
const routes: Routes = [
  // Route authentification
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module')
      .then(m => m.AuthModule)
  },

  // Routes protégées avec LayoutComponent
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module')
          .then(m => m.DashboardModule)
      },
      {
        path: 'transactions',
        loadChildren: () => import('./modules/transactions/transactions.module')
          .then(m => m.TransactionsModule)
      },
      {
        path: 'budgets',
        loadChildren: () => import('./modules/budgets/budgets.module')
          .then(m => m.BudgetsModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./modules/admin/admin.module')
          .then(m => m.AdminModule)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Redirection par défaut
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' }
];
```

### Lazy Loading expliqué:
- Les modules ne sont chargés que quand l'utilisateur les visite
- ✅ Réduit la taille initiale du bundle
- ✅ Améliore les performances
- ✅ Exemple: Le module Auth (~24 KB) ne charge que si vous allez sur `/auth`

---

## 🎨 Design System

### Couleurs
```css
Primary: #667eea (Bleu)
Secondary: #764ba2 (Rose)
Gradient: linear-gradient(135deg, #667eea, #764ba2)

Success: #28a745 (Vert)
Warning: #ffc107 (Orange)
Danger: #dc3545 (Rouge)
Info: #17a2b8 (Cyan)
```

### Responsive Design
```css
Desktop: >= 1024px (3 colonnes)
Tablet: 768px - 1023px (2 colonnes)
Mobile: < 768px (1 colonne)

Breakpoint principal: @media (max-width: 768px)
```

---

## 💾 Persistance des Données

### localStorage Keys:
```javascript
'finova_token'          // JWT token (simulé)
'finova_user'           // User object
'finova_transactions'   // Array<Transaction>
'finova_budgets'        // Array<Budget>
'finova_suppliers'      // Array<Supplier>
```

### Exemple de sauvegarde:
```typescript
// Dans TransactionService
private saveToLocalStorage(): void {
  const json = JSON.stringify(this.transactions);
  localStorage.setItem('finova_transactions', json);
}

private loadFromLocalStorage(): void {
  const json = localStorage.getItem('finova_transactions');
  this.transactions = json ? JSON.parse(json) : [];
}
```

---

## 🔄 Flux de Données (Data Flow)

### Exemple: Ajouter une transaction

```
1. User tape une transaction dans TransactionFormComponent
   ↓
2. onSubmit() appelle transactionService.create(transaction)
   ↓
3. TransactionService:
   - Génère un ID
   - Ajoute à l'array en mémoire
   - Sauvegarde en localStorage
   - Retourne la transaction créée
   ↓
4. TransactionFormComponent redirige vers la liste
   ↓
5. TransactionListComponent charge les données avec loadTransactions()
   ↓
6. Template Angular affiche la nouvelle transaction
```

### Exemple: Afficher le Dashboard

```
1. User visite /dashboard
   ↓
2. DashboardComponent.ngOnInit()
   ↓
3. dashboardService.getDashboardData():
   - Récupère toutes les transactions
   - Calcule les totaux (revenus, dépenses, balance)
   - Groupe par mois et catégorie
   - Génère les alertes
   - Retourne un objet DashboardData complet
   ↓
4. DashboardComponent.initializeCharts():
   - Transforme les données pour Chart.js
   - Crée 3 configurations de graphiques
   ↓
5. Template affiche les KPI cards et les graphiques
```

---

## 📊 Types de Données en Détail

### Transaction
```typescript
{
  id: "tx_123",
  type: "expense",              // 'income' | 'expense'
  amount: 50,
  category: "Transport",         // 6 catégories possibles
  description: "Carburant",
  date: Date(2025-12-03)
}
```

### Budget
```typescript
{
  id: "budg_123",
  category: "Transport",         // Catégorie liée
  month: "2025-12",             // Mois au format YYYY-MM
  limit: 100                     // Limite mensuelle
}
```

### Alert
```typescript
{
  message: "Budget Transport dépassé (120% utilisé)",
  severity: "danger",            // 'info' | 'warning' | 'danger'
  date: Date(2025-12-03)
}
```

---

## 🎯 Cas d'Usage Pratiques

### Cas 1: Créer une transaction
```
Dashboard → Transactions → [+] Ajouter
→ Remplir formulaire: type, montant, catégorie, date
→ Cliquer "Enregistrer"
→ Service crée la transaction et la sauvegarde
→ Redirection vers la liste
```

### Cas 2: Suivre un budget
```
Budgets → Créer budget (Transport, 100€/mois)
→ Chaque transaction "Transport" est comptabilisée
→ Dashboard affiche un avertissement si > 100€
→ Barre de progression rouge si dépassé
```

### Cas 3: Analyser les finances
```
Dashboard affiche:
- Balance actuelle (revenus - dépenses)
- Graphique des dépenses mensuelles
- Répartition par catégorie
- Alertes automatiques si budget dépassé
```

---

## 🚀 Performance & Optimisations

### ✅ Lazy Loading des Modules
- Chaque module charge uniquement si visité
- Réduit le bundle initial (~97 KB au lieu de ~200 KB)

### ✅ OnPush Change Detection (À ajouter)
```typescript
@Component({
  selector: 'app-transaction-list',
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### ✅ TrackBy pour les *ngFor
```html
<div *ngFor="let tx of transactions; trackBy: trackById">
  {{ tx.description }}
</div>
```

### ✅ Unsubscribe dans OnDestroy
```typescript
ngOnDestroy(): void {
  this.subscription.unsubscribe();
}
```

---

## 🔌 Conversion vers une API Réelle

### Actuellement (localStorage):
```typescript
create(transaction: Transaction): Transaction {
  this.transactions.push(transaction);
  localStorage.setItem(...);  // ← Sauvegarde locale
  return transaction;
}
```

### Vers une API REST:
```typescript
create(transaction: Transaction): Observable<Transaction> {
  return this.http.post<Transaction>(
    'http://api.exemple.com/transactions',
    transaction
  );
}
```

### Changements nécessaires:
1. Injecter `HttpClient` au lieu de localStorage
2. Retourner des `Observable` au lieu de `Transaction`
3. S'abonner dans les composants avec `subscribe()`
4. Ajouter la gestion d'erreurs avec `catch()` ou `catchError()`

---

## 📝 Résumé des Fichiers Importants

| Fichier | Rôle | Type |
|---------|------|------|
| `auth.service.ts` | Gestion authentification | Service |
| `auth.guard.ts` | Protection des routes | Guard |
| `transaction.service.ts` | CRUD transactions | Service |
| `dashboard.service.ts` | Calculs KPIs | Service |
| `login.component.ts` | Page de connexion | Component |
| `dashboard.component.ts` | Affichage KPIs + charts | Component |
| `transaction-list.component.ts` | Liste transactions + filtres | Component |
| `app-routing.module.ts` | Routes avec lazy loading | Routing |
| `layout.component.ts` | Shell principal (navbar + sidebar) | Component |

---

## 🎓 Concepts Clés Appliqués

### 1. **Modules (NgModule)**
- Grouper les composants, services, pipes
- Lazy loading pour le code-splitting

### 2. **Reactive Programming (RxJS)**
- `BehaviorSubject` pour l'état (currentUser$)
- `Observable` pour les flux de données

### 3. **Reactive Forms**
- `FormBuilder` pour créer les formulaires
- Validation avec `Validators`
- `FormGroup` et `FormControl`

### 4. **Guards (CanActivate)**
- Protéger les routes authentifiées
- Rediriger vers login si pas connecté

### 5. **Services (Singleton)**
- Un seul service par domaine
- Partagé entre tous les composants
- Injectable via le DI d'Angular

### 6. **TypeScript Interfaces**
- Typage fort pour les données
- Autocomplétion et vérification d'erreurs

### 7. **Change Detection**
- Angular détecte automatiquement les changements
- Met à jour le DOM en conséquence

### 8. **Dependency Injection**
- Services injectés dans les constructeurs
- Géré par le DI Container d'Angular

---

## 📚 Ressources pour Aller Plus Loin

1. **Ajouter une API REST**: Remplacer localStorage par `HttpClient`
2. **State Management**: Ajouter NgRx ou Akita
3. **Tests Unitaires**: Utiliser Jasmine + Karma
4. **Tests E2E**: Protractor ou Cypress
5. **PWA**: Ajouter Service Worker pour offline
6. **Authentification JWT**: Intégrer un vrai backend
7. **Build Prod**: `ng build --prod` pour optimiser

---

**Finova v1.0 | Architecture complète et fonctionnelle | Décembre 2025**
