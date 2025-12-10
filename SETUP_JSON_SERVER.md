# 🔧 Setup JSON-Server + Synchronisation Multi-Utilisateurs

## 📋 Étape 1: Installer JSON-Server

```bash
cd finova
npm install json-server --save-dev
```

## ▶️ Étape 2: Lancer JSON-Server

### Option 1: Globalement
```bash
npm install -g json-server
json-server --watch db.json --port 3000
```

### Option 2: Via npm script (RECOMMANDÉ)

Ajouter dans `package.json`:
```json
{
  "scripts": {
    "start": "ng serve --port 4200",
    "start:dev": "concurrently \"npm run api\" \"ng serve\"",
    "api": "json-server --watch db.json --port 3000"
  }
}
```

Installer concurrently:
```bash
npm install concurrently --save-dev
```

Lancer les deux:
```bash
npm run start:dev
```

## 📁 Structure des Données (db.json)

```json
{
  "users": [
    {
      "id": "1",
      "email": "test@finova.fr",
      "password": "password123",
      "name": "Test User"
    }
  ],
  "transactions": [
    {
      "id": "tx_1",
      "userId": "1",        // ← Important: lie à un utilisateur
      "type": "income",
      "amount": 3000,
      "category": "Salaire",
      "description": "Salaire mensuel",
      "date": "2025-12-03"
    }
  ],
  "budgets": [
    {
      "id": "budg_1",
      "userId": "1",        // ← Important: lie à un utilisateur
      "category": "Transport",
      "month": "2025-12",
      "limit": 100
    }
  ],
  "suppliers": [
    {
      "id": "supp_1",
      "userId": "1",        // ← Important: lie à un utilisateur
      "name": "TechServices Inc.",
      ...
    }
  ]
}
```

**Point clé:** Chaque entité a `userId` pour savoir à quel utilisateur appartient la donnée.

---

## 🔐 AuthService (Modifié pour API)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Login: Récupère l'utilisateur de l'API
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}`)
      .pipe(
        map(users => {
          const user = users.find(u => u.password === password);
          if (!user) {
            throw new Error('Email ou mot de passe incorrect');
          }
          return user;
        }),
        tap(user => {
          // Stocke en localStorage
          localStorage.setItem('finova_token', user.id);
          localStorage.setItem('finova_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('finova_token');
    localStorage.removeItem('finova_user');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('finova_token');
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem('finova_token');
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('finova_user');
    return user ? JSON.parse(user) : null;
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('finova_user');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }
}
```

---

## 📊 TransactionService (Modifié pour API + Utilisateur)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Récupère les transactions de l'utilisateur actuel
  getAll(): Observable<Transaction[]> {
    const userId = this.authService.getCurrentUserId();
    // Filtre par userId
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/transactions?userId=${userId}`
    );
  }

  getById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(
      `${this.apiUrl}/transactions/${id}`
    );
  }

  // Créer une transaction
  create(transaction: Omit<Transaction, 'id' | 'userId'>): Observable<Transaction> {
    const userId = this.authService.getCurrentUserId();
    const newTx = {
      ...transaction,
      userId,
      id: this.generateId()
    };
    return this.http.post<Transaction>(
      `${this.apiUrl}/transactions`,
      newTx
    );
  }

  // Modifier une transaction
  update(id: string, updates: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(
      `${this.apiUrl}/transactions/${id}`,
      updates
    );
  }

  // Supprimer une transaction
  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/transactions/${id}`
    );
  }

  // Recherche
  search(query: string): Observable<Transaction[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/transactions?userId=${userId}&description_like=${query}`
    );
  }

  // Filtrer par type
  filterByType(type: 'income' | 'expense'): Observable<Transaction[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/transactions?userId=${userId}&type=${type}`
    );
  }

  // Filtrer par catégorie
  filterByCategory(category: string): Observable<Transaction[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<Transaction[]>(
      `${this.apiUrl}/transactions?userId=${userId}&category=${category}`
    );
  }

  private generateId(): string {
    return 'tx_' + Math.random().toString(36).substr(2, 9);
  }
}
```

---

## 🖥️ Composants (Modifiés pour Observable)

### TransactionListComponent

```typescript
export class TransactionListComponent implements OnInit {
  transactions$ : Observable<Transaction[]>;
  filteredTransactions: Transaction[] = [];
  searchQuery = '';
  filterType: 'all' | 'income' | 'expense' = 'all';
  loading = true;
  error = '';

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    // Utilise les observables directement
    this.transactionService.getAll()
      .subscribe(
        (transactions) => {
          this.transactions$ = of(transactions);
          this.applyFilters();
          this.loading = false;
        },
        (error) => {
          this.error = 'Erreur lors du chargement';
          this.loading = false;
        }
      );
  }

  applyFilters(): void {
    this.transactions$.subscribe(transactions => {
      let filtered = [...transactions];

      if (this.filterType !== 'all') {
        filtered = filtered.filter(t => t.type === this.filterType);
      }

      if (this.searchQuery.trim()) {
        filtered = filtered.filter(t =>
          t.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      this.filteredTransactions = filtered;
    });
  }

  deleteTransaction(id: string): void {
    if (confirm('Êtes-vous sûr?')) {
      this.transactionService.delete(id).subscribe(
        () => {
          this.loadTransactions(); // Recharge après suppression
        },
        (error) => {
          this.error = 'Erreur lors de la suppression';
        }
      );
    }
  }

  createTransaction(data: any): void {
    this.transactionService.create(data).subscribe(
      (newTx) => {
        this.loadTransactions(); // Recharge après création
      },
      (error) => {
        this.error = 'Erreur lors de la création';
      }
    );
  }
}
```

---

## 🔄 Synchronisation Multi-Utilisateurs

### Avant (localStorage):
```
User 1 → localStorage (données isolées)
User 2 → localStorage (données isolées)
← Aucune synchronisation
```

### Après (JSON-Server):
```
User 1 → API REST → db.json
                ↓
User 2 → API REST → db.json
        (Récupère les données à jour)
```

### Exemple Real-Time (WebSocket - optionnel):

Pour synchronisation **en temps réel** entre onglets/utilisateurs:

```bash
npm install socket.io-client
```

```typescript
import { io } from 'socket.io-client';

export class SyncService {
  private socket = io('http://localhost:3000');

  watchTransactions(userId: string) {
    return new Observable(observer => {
      this.socket.on(`transactions:${userId}`, (data) => {
        observer.next(data); // Notifie en temps réel
      });
    });
  }

  notifyTransactionCreated(transaction: Transaction) {
    this.socket.emit(`transactions:${transaction.userId}:created`, transaction);
  }
}
```

---

## ✅ Avantages Maintenant

✅ **Données centralisées** en db.json  
✅ **Multi-utilisateurs**: Chaque user voit ses données  
✅ **Synchronisation**: Modifications visibles immédiatement  
✅ **Persistance**: Les données surviven aux redémarrages  
✅ **Authentification**: Login vérifie l'utilisateur  
✅ **Isolation**: User 1 ne voit pas les données de User 2  

---

## 🚀 Commandes Utiles

```bash
# Lancer Angular + API ensemble
npm run start:dev

# Lancer juste le serveur API
npm run api

# Lancer juste Angular
npm start

# Voir les données en temps réel (http://localhost:3000)
```

---

## 📝 Résumé des Changements

| Avant | Après |
|-------|-------|
| localStorage | API REST (JSON-Server) |
| Synchrone | Asynchrone (Observable) |
| Un seul utilisateur | Multi-utilisateurs |
| Pas d'authentification serveur | Vérification serveur |
| Données isolées | Données centralisées |

---

## 🔗 Fichiers à Modifier

1. **AuthService** - Appels HTTP au lieu de localStorage
2. **TransactionService** - Appels HTTP
3. **BudgetService** - Appels HTTP
4. **SupplierService** - Appels HTTP
5. **DashboardService** - Agrège les données depuis l'API
6. **Composants** - Utilisent Observable au lieu de getter direct

---

Veux-tu que je **mette à jour tous les services** pour utiliser l'API JSON-Server?
