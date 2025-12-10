# 📚 Finova - Résumé Court de l'Architecture

## 🏗️ Structure Générale

```
AppComponent (racine)
    ↓
LayoutComponent (navbar + sidebar)
    ↓
Routes protégées par AuthGuard
    ├── Auth Module (login)
    ├── Dashboard Module (KPIs + charts)
    ├── Transactions Module (CRUD + filtres)
    ├── Budgets Module (suivi budgets)
    └── Admin Module (fournisseurs)
```

---

## 🗂️ Dossiers Clés

```
src/app/
├── core/
│   ├── models/           → Interfaces TypeScript
│   ├── services/         → Auth, Transaction, Budget, Dashboard
│   └── guards/           → AuthGuard (protection routes)
├── modules/              → 5 modules métier (lazy-loaded)
│   ├── auth/
│   ├── dashboard/
│   ├── transactions/
│   ├── budgets/
│   ├── admin/
│   └── layout/
└── app-routing.module.ts → Routing principal
```

---

## 🔐 Authentification

**AuthService:**
- `login(email, password)` → génère token + stocke en localStorage
- `logout()` → efface données
- `isAuthenticated()` → vérifie si connecté
- `currentUser$` → Observable pour la réactivité

**AuthGuard:**
- Protège les routes avec `canActivate`
- Redirige vers login si pas authentifié

**Test:** Email: `test@finova.fr` | Password: `password123`

---

## 💾 Services (Métier)

### TransactionService
```
getAll()              → toutes les transactions
create(tx)            → ajouter
update(id, data)      → modifier
delete(id)            → supprimer
search(query)         → recherche
filterByType(type)    → filtre revenu/dépense
filterByCategory(cat) → filtre par catégorie
```

### BudgetService
```
getUtilizationPercentage(id) → % utilisé
isExceeded(id)               → budget dépassé?
create/update/delete         → CRUD
```

### DashboardService
```
getDashboardData() → retourne:
  - totalBalance (revenus - dépenses)
  - totalIncome
  - totalExpenses
  - growthPercentage
  - monthlyExpenses (graphique 1)
  - expensesByCategory (graphique 2)
  - monthlyIncome (graphique 3)
  - alerts (budget dépassé, etc.)
```

---

## 🖥️ Composants Principaux

### LoginComponent
- Formulaire réactif (email + password)
- Validation (email valide, password 6+ caractères)
- Appelle `authService.login()`

### DashboardComponent
- Affiche 4 KPI cards (balance, revenus, dépenses, croissance)
- 3 graphiques Chart.js (dépenses mensuelles, par catégorie, revenus)
- Alertes (budget dépassé)

### TransactionListComponent
- Liste avec pagination (10/page)
- Filtres: type (income/expense), catégorie, recherche
- Boutons: ajouter, éditer, supprimer

### BudgetListComponent
- Cards avec barre de progression
- Couleurs: vert <80%, orange 80-100%, rouge >100%

---

## 🔄 Flux de Données

**Ajouter une transaction:**
```
Form → transactionService.create(tx)
  → Array en mémoire
  → localStorage
  → Redirection vers liste
  → Liste se recharge
```

**Afficher Dashboard:**
```
ngOnInit()
  → dashboardService.getDashboardData()
    → Calcule totaux et agrégations
    → Groupe par mois/catégorie
    → Génère alertes
  → Affiche KPI cards + graphiques
```

---

## 📊 Graphiques Chart.js

1. **Dépenses Mensuelles** (ligne) - Trend mensuel
2. **Dépenses par Catégorie** (doughnut) - Répartition
3. **Revenus Mensuels** (barres) - Comparaison

---

## 💾 localStorage Keys

```
finova_token          → JWT (simulé)
finova_user           → User object
finova_transactions   → Array<Transaction>
finova_budgets        → Array<Budget>
finova_suppliers      → Array<Supplier>
```

---

## 🎨 Design

- **Couleurs**: Gradient #667eea (bleu) → #764ba2 (rose)
- **Responsive**: Desktop, tablet, mobile
- **CSS pur**: Pas de Bootstrap/Material

---

## 📝 Types de Données

**Transaction**
```ts
{
  id: string,
  type: 'income' | 'expense',
  amount: number,
  category: 'Salaire' | 'Abonnements' | 'Achats' | 'Transport' | 'Maintenance' | 'Autre',
  description: string,
  date: Date
}
```

**Budget**
```ts
{
  id: string,
  category: string,
  month: string,    // "2025-12"
  limit: number
}
```

**Supplier**
```ts
{
  id, name, email, phone, address, city, postalCode, country, companyNumber
}
```

---

## 🚀 Lazy Loading des Modules

- Auth Module charge seulement si `/auth`
- Dashboard si `/dashboard`
- Transactions si `/transactions`
- etc.

**Avantage:** Bundle initial réduit (~97 KB)

---

## 🔗 Routing Principal

```ts
'/auth' → AuthModule (login)
'/'     → LayoutComponent (protégé par AuthGuard)
  ├── 'dashboard'     → DashboardModule
  ├── 'transactions'  → TransactionsModule
  ├── 'budgets'       → BudgetsModule
  └── 'admin'         → AdminModule
```

---

## ✅ Fonctionnalités

- ✅ Authentification par token
- ✅ Protection des routes
- ✅ CRUD transactions avec filtres + pagination
- ✅ Suivi budgets avec alertes
- ✅ Dashboard avec KPIs + 3 graphiques
- ✅ Gestion fournisseurs
- ✅ Responsive design
- ✅ localStorage persistence

---

## 🔌 Passer à une API Réelle

Remplacer:
```ts
// Maintenant
localStorage.setItem('finova_transactions', JSON.stringify(transactions));

// Par
this.http.post('http://api.exemple.com/transactions', transaction);
```

Puis utiliser `.subscribe()` dans les composants.

---

**Version courte complète | Finova v1.0**
