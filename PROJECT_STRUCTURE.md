# 📁 Structure du Projet FINOVA

## Vue d'ensemble
Application Angular multi-locataire (multi-tenancy) de gestion financière avec authentification, approbation d'utilisateurs et gestion de rôles.

---

## 🏗️ Architecture Générale

```
finova/
├── src/
│   ├── app/
│   │   ├── core/                    # Services, guards, models
│   │   ├── modules/                 # Modules fonctionnels
│   │   ├── shared/                  # Composants partagés
│   │   ├── app.module.ts            # Module principal
│   │   ├── app-routing.module.ts    # Routes principales
│   │   └── app.component.*          # Composant racine
│   ├── assets/                      # Images, icons
│   ├── styles.css                   # Styles globaux
│   ├── main.ts                      # Point d'entrée
│   └── index.html                   # HTML principal
├── db.json                          # Base de données JSON (JSON-Server)
├── angular.json                     # Configuration Angular
├── package.json                     # Dépendances NPM
├── tsconfig.json                    # Configuration TypeScript
└── README.md                        # Documentation
```

---

## 📦 Structure Détaillée

### **1. Core Module** (`src/app/core/`)
Contient les services, guards et modèles partagés.

```
core/
├── guards/
│   └── auth.guard.ts                # Protection des routes (authentification)
│   └── admin.guard.ts               # Protection des routes (admin)
├── models/
│   └── index.ts                     # Interfaces TypeScript
│       ├── User
│       ├── Company
│       ├── Transaction
│       ├── Wallet
│       ├── Budget
│       ├── Supplier
│       ├── Client
│       └── Alert
├── services/
│   ├── auth.service.ts              # Authentification (login/signup)
│   ├── user.service.ts              # Gestion des utilisateurs [NEW]
│   ├── budget.service.ts            # Budgets
│   ├── dashboard.service.ts         # Dashboard
│   ├── supplier.service.ts          # Fournisseurs
│   ├── transaction.service.ts       # Transactions
│   └── index.ts                     # Exports
```

**Méthodes clés de AuthService:**
- `signup(email, password, name, companyId, role)` → Crée user avec status='pending'
- `login(email, password)` → Valide status !== 'pending'
- `logout()` → Déconnecte l'utilisateur

**Méthodes clés de UserService:**
- `getUsersByCompany(companyId)` → Récupère users de l'entreprise
- `approveUser(userId, role)` → Change status pending→active
- `rejectUser(userId)` → Supprime l'utilisateur
- `updateUserRole(userId, role)` → Modifie le rôle

---

### **2. Layout Module** (`src/app/modules/layout/`)
Navigation et structure générale de l'application.

```
layout/
├── layout.module.ts
├── layout.component.*               # Conteneur principal
├── navbar/
│   ├── navbar.component.ts
│   ├── navbar.component.html        # Barre de navigation
│   └── navbar.component.css
└── sidebar/
    ├── sidebar.component.ts         # [MODIFIÉ] Ajout "Gestion Utilisateurs"
    ├── sidebar.component.html
    └── sidebar.component.css
```

---

### **3. Auth Module** (`src/app/modules/auth/`)
Authentification (login, signup, etc.)

```
auth/
├── auth-routing.module.ts
├── auth.module.ts
└── components/
    ├── login/
    │   ├── login.component.ts       # Validation status=pending
    │   ├── login.component.html
    │   └── login.component.css
    └── signup/
        ├── signup.component.ts      # [MODIFIÉ] Sélection de companyId
        ├── signup.component.html    # [MODIFIÉ] Ajout dropdown entreprises
        └── signup.component.css
```

**Flux Signup:**
1. Charge les entreprises disponibles
2. Utilisateur remplit: nom, email, sélectionne entreprise, mot de passe
3. Crée user avec status='pending'
4. Redirection vers login

**Flux Login:**
1. Vérifie status !== 'pending' → Erreur si attente
2. Vérifie status === 'active' → Connexion réussie
3. Charge contexte de l'entreprise

---

### **4. Dashboard Module** (`src/app/modules/dashboard/`)
Tableau de bord principal après connexion.

```
dashboard/
├── dashboard-routing.module.ts
├── dashboard.module.ts
└── components/
    └── dashboard/
        ├── dashboard.component.ts   # Affiche données filtrées par entreprise
        ├── dashboard.component.html
        └── dashboard.component.css
```

---

### **5. Admin Module** (`src/app/modules/admin/`)
Interface d'administration.

```
admin/
├── admin-routing.module.ts          # [MODIFIÉ] Route /admin/users
├── admin.module.ts                  # [MODIFIÉ] Import UserManagementComponent
└── components/
    ├── supplier-list/               # Gestion des fournisseurs
    ├── supplier-form/
    ├── supplier-detail/
    ├── reports/                     # Rapports financiers
    └── user-management/             # [NEW] Approbation utilisateurs
        ├── user-management.component.ts    # Logique (2 onglets)
        ├── user-management.component.html  # Interface
        └── user-management.component.css   # Styles (responsive)
```

**UserManagementComponent - Onglet 1: En attente d'approbation**
- Liste des users avec status='pending'
- Dropdown pour sélectionner le rôle
- Bouton "✓ Approuver" → appelle UserService.approveUser()
- Bouton "✕ Rejeter" → appelle UserService.rejectUser()

**UserManagementComponent - Onglet 2: Utilisateurs Actifs**
- Liste des users avec status='active'
- Bouton "Modifier le rôle" → mode inline edit
- Bouton "Enregistrer" → appelle UserService.updateUserRole()

---

### **6. Budgets Module** (`src/app/modules/budgets/`)
Gestion des budgets.

```
budgets/
├── budgets-routing.module.ts
├── budgets.module.ts
└── components/
    ├── budget-list/
    ├── budget-form/
    └── budget-detail/
```

---

### **7. Transactions Module** (`src/app/modules/transactions/`)
Gestion des transactions financières.

```
transactions/
├── transactions-routing.module.ts
├── transactions.module.ts
└── components/
    ├── transaction-list/
    ├── transaction-form/
    └── transaction-detail/
```

---

### **8. Shared Module** (`src/app/shared/`)
Composants réutilisables.

```
shared/
└── components/
    └── (composants communs)
```

---

## 🗄️ Base de Données (db.json)

Structure JSON-Server avec 8 collections:

```json
{
  "companies": [           // Entreprises
    { id, name, industry, email, phone, ... }
  ],
  "users": [              // Utilisateurs
    { 
      id, email, password, name, role, companyId, 
      permissions, status  // ← 'pending' | 'active' | 'inactive' | 'suspended'
    }
  ],
  "wallets": [            // Portefeuilles/comptes
    { id, companyId, name, type, balance, currency, ... }
  ],
  "transactions": [       // Transactions financières
    { id, companyId, walletId, type, status, amount, ... }
  ],
  "budgets": [            // Budgets
    { id, companyId, walletId, category, limit, spent, ... }
  ],
  "suppliers": [          // Fournisseurs
    { id, companyId, name, email, phone, ... }
  ],
  "clients": [            // Clients
    { id, companyId, name, email, phone, ... }
  ],
  "alerts": [             // Alertes/notifications
    { id, companyId, type, severity, title, message, ... }
  ],
  "auditLog": [           // Journal d'audit
    { id, companyId, userId, action, timestamp, ... }
  ]
}
```

---

## 🔐 Modèle de Sécurité

### **Statuts d'utilisateur:**
```
pending     → En attente d'approbation (ne peut pas login)
active      → Approuvé (peut login)
inactive    → Désactivé
suspended   → Suspendu
```

### **Rôles et Permissions:**

| Rôle | Permissions |
|------|-----------|
| **admin** | full_access, view_all_wallets, manage_users, manage_suppliers, etc. |
| **treasurer** | view_all_wallets, create_transaction, approve_high, manage_budgets |
| **manager** | view_own_wallets, create_transaction, approve_transactions |
| **accountant** | view_all_transactions, view_reports, export_data |
| **viewer** | view_own_wallets (lecture seule) |

### **Guards:**
- `AuthGuard` → Vérifie authentification
- `AdminGuard` → Vérifie role='admin' + full_access permission

---

## 🔄 Flux d'Approbation Utilisateur

```
┌─────────────────┐
│ NOUVEL USER     │
│ S'INSCRIT       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ signup() crée user avec:            │
│ - email, password, name             │
│ - companyId (sélectionné par user)  │
│ - status: 'pending'                 │
│ - role: 'viewer'                    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ USER VOIT MESSAGE:              │
│ "En attente d'approbation..."   │
│ Redirigé vers /auth/login       │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ USER ESSAIE LOGIN               │
│ ❌ REJETÉ:                       │
│ "Compte en attente d'approbation"│
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ ADMIN VA À:                      │
│ /admin/users                     │
│ (Gestion Utilisateurs)           │
└────────┬─────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ ADMIN VOIT ONGLET 1:               │
│ "En attente d'approbation"         │
│ - USER LISTED                      │
│ - DROPDOWN: Sélectionner rôle      │
│ - BOUTON: ✓ Approuver             │
└────────┬───────────────────────────┘
         │ Admin clique "Approuver"
         │ avec rôle = 'treasurer'
         ▼
┌─────────────────────────────────────┐
│ approveUser() APPELLE:              │
│ PATCH /users/:id                    │
│ {                                   │
│   status: 'active',                 │
│   role: 'treasurer',                │
│   permissions: [...]                │
│ }                                   │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ USER DEVIENT 'ACTIVE'            │
│ ✓ Permissions assignées           │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ USER PEUT MAINTENANT:        │
│ ✓ LOGIN avec succès          │
│ ✓ ACCÈS AU DASHBOARD         │
│ ✓ VOIR SES DONNÉES           │
└──────────────────────────────┘
```

---

## 📚 Routes Principales

```
/                               → Redirige vers /dashboard ou /auth/login
/auth/login                     → Page de connexion
/auth/signup                    → Formulaire d'inscription
/dashboard                      → Tableau de bord (protégé)
/admin/suppliers                → Liste fournisseurs (admin only)
/admin/suppliers/new            → Nouveau fournisseur (admin only)
/admin/suppliers/:id            → Détail fournisseur (admin only)
/admin/suppliers/:id/edit       → Editer fournisseur (admin only)
/admin/users                    → Gestion utilisateurs (admin only) [NEW]
/admin/reports                  → Rapports (admin only)
/budgets                        → Gestion budgets (protégé)
/budgets/:id                    → Détail budget (protégé)
/transactions                   → Liste transactions (protégé)
/transactions/:id               → Détail transaction (protégé)
```

---

## 🌐 Localization

**Devise:**
- Toutes les valeurs en TND (Dinar Tunisien)

**Langue:**
- Interface complète en Français
- Messages d'erreur en Français

**Données:**
- Noms, villes, adresses en Tunisie
- Entreprises tunisiennes fictives

---

## 📦 Dépendances Principales

```json
{
  "@angular/core": "^17",
  "@angular/forms": "^17",
  "@angular/router": "^17",
  "@angular/common/http": "^17",
  "rxjs": "^7",
  "json-server": "^0.17"
}
```

---

## 🚀 Démarrage de l'Application

### **Terminal 1: Frontend**
```bash
cd finova
npm install
npm start
```
Accessible sur: `http://localhost:4200`

### **Terminal 2: Backend (JSON-Server)**
```bash
json-server db.json
```
API disponible sur: `http://localhost:3000`

---

## 📋 Fichiers Modifiés/Créés (Session Actuelle)

### **Créés:**
- ✅ `src/app/core/services/user.service.ts` - Service gestion utilisateurs
- ✅ `src/app/modules/admin/components/user-management/user-management.component.ts`
- ✅ `src/app/modules/admin/components/user-management/user-management.component.html`
- ✅ `src/app/modules/admin/components/user-management/user-management.component.css`
- ✅ `USER_MANAGEMENT_GUIDE.md` - Documentation système
- ✅ `IMPLEMENTATION_SUMMARY.md` - Résumé des changements

### **Modifiés:**
- ✅ `src/app/core/models/index.ts` - Ajout status='pending' au User
- ✅ `src/app/core/services/auth.service.ts` - Signup/login validation
- ✅ `src/app/core/services/index.ts` - Export UserService
- ✅ `src/app/modules/auth/components/signup/signup.component.ts` - Sélection companyId
- ✅ `src/app/modules/auth/components/signup/signup.component.html` - Dropdown entreprises
- ✅ `src/app/modules/admin/admin.module.ts` - Import UserManagementComponent
- ✅ `src/app/modules/admin/admin-routing.module.ts` - Route /admin/users
- ✅ `src/app/modules/layout/sidebar/sidebar.component.html` - Lien "Gestion Utilisateurs"

---

## ✨ Caractéristiques Principales

✅ **Multi-tenancy** - Isolation des données par entreprise
✅ **Authentification** - Login/signup avec validation
✅ **Approbation d'utilisateurs** - Admin approuve les nouveaux comptes
✅ **Gestion des rôles** - 5 rôles avec permissions préfinies
✅ **Gestion financière** - Transactions, budgets, portefeuilles
✅ **Fournisseurs/Clients** - Gestion des entités externes
✅ **Alertes** - Notifications en temps réel
✅ **Audit** - Journal des actions administratives
✅ **Localization** - TND, Français, Tunisie
✅ **Responsive Design** - Interface mobile-friendly

---

## 📞 Support & Documentation

- **USER_MANAGEMENT_GUIDE.md** - Guide complet du système d'approbation
- **IMPLEMENTATION_SUMMARY.md** - Résumé technique des modifications
- **FINOVA_APP_GUIDE.md** - Guide général de l'application
- **ARCHITECTURE_EXPLIQUEE.md** - Architecture détaillée

---

**Dernier mise à jour:** 10 Décembre 2025
**Version:** 1.0 (Production Ready)
**Statut:** ✅ Prêt pour présentation
