# Gestion des Utilisateurs - Système d'Approbation

## Vue d'Ensemble

Le système de gestion des utilisateurs permet aux administrateurs d'entreprise d'approuver les nouveaux comptes et de gérer les rôles des utilisateurs.

## Flux d'Inscription et d'Approbation

### 1. Inscription de l'Utilisateur
- L'utilisateur remplit le formulaire d'inscription
- L'utilisateur est créé dans la base de données avec le statut **`pending`**
- Rôle par défaut: **`viewer`**
- L'utilisateur reçoit un message: "Inscription réussie! En attente d'approbation de l'administrateur"

### 2. Tentative de Connexion (Avant Approbation)
- ❌ L'utilisateur ne peut **PAS** se connecter
- Message d'erreur: "Votre compte est en attente d'approbation par un administrateur"

### 3. Approbation par l'Admin
- L'admin accède à **Gestion des Utilisateurs** (👥)
- Voit l'onglet **"En attente d'approbation"**
- Choisit un rôle pour l'utilisateur
- Clique sur **"✓ Approuver"**
- Le statut passe de `pending` → `active`

### 4. Connexion Après Approbation
- ✅ L'utilisateur peut maintenant se connecter
- Accès complet selon le rôle assigné

## Rôles et Permissions

| Rôle | Permissions | Description |
|------|-------------|-------------|
| **admin** | full_access | Accès complet à toutes les fonctionnalités |
| **treasurer** | view_all_wallets, create_transaction, approve_high, manage_budgets, view_reports | Gestion financière complète |
| **manager** | view_own_wallets, create_transaction, approve_transactions, view_reports | Gestion des transactions limitée |
| **accountant** | view_all_transactions, view_all_wallets, view_all_budgets, view_reports, export_data | Visualisation et export |
| **approver** | approve_high, view_reports | Approbation de transactions |
| **viewer** | view_reports | Consultation des rapports (rôle par défaut) |

## Interface de Gestion des Utilisateurs

### Onglet "En attente d'approbation"
```
┌─────────────────────────────────┐
│ Utilisateur                     │
│ email@example.com               │
├─────────────────────────────────┤
│ [Sélectionner un rôle ▼]        │
├─────────────────────────────────┤
│ [✓ Approuver] [✗ Rejeter]       │
└─────────────────────────────────┘
```

### Onglet "Utilisateurs Actifs"
```
┌─────────────────────────────────┐
│ Utilisateur                     │
│ email@example.com               │
│ Rôle: Treasurer                 │
│ 5 permissions                   │
├─────────────────────────────────┤
│ [Modifier le rôle]              │
└─────────────────────────────────┘
```

## Actions Disponibles

### Approuver un Utilisateur
1. Aller dans **Admin → Gestion des Utilisateurs**
2. Onglet **"En attente d'approbation"**
3. Sélectionner un rôle dans le dropdown
4. Cliquer **"✓ Approuver"**

### Rejeter un Utilisateur
1. Onglet **"En attente d'approbation"**
2. Cliquer **"✗ Rejeter"**
3. Confirmer la suppression
4. L'utilisateur est supprimé de la base de données

### Modifier le Rôle d'un Utilisateur
1. Onglet **"Utilisateurs Actifs"**
2. Cliquer **"Modifier le rôle"** sur la carte de l'utilisateur
3. Sélectionner le nouveau rôle
4. Cliquer **"Enregistrer"**
5. Les permissions sont mises à jour automatiquement

## Considérations de Sécurité

### Statuts d'Utilisateur
- **pending**: Nouvel utilisateur en attente d'approbation → Pas d'accès
- **active**: Utilisateur approuvé → Accès selon le rôle
- **inactive**: Utilisateur désactivé → Pas d'accès
- **suspended**: Compte suspendu → Pas d'accès

### Contrôle d'Accès
- Seuls les **admins** peuvent accéder à la gestion des utilisateurs
- Chaque utilisateur ne voit que les utilisateurs de sa propre entreprise (multi-tenancy)
- Le statut est vérifié à chaque tentative de connexion

## Points Clés d'Implémentation

### Services Modifiés
- **UserService**: Nouveaux services pour la gestion des utilisateurs
- **AuthService**: Vérification du statut lors du login

### Composants Créés
- **UserManagementComponent**: Interface d'administration des utilisateurs

### Routes Ajoutées
- `/admin/users`: Page de gestion des utilisateurs

### Modèles Modifiés
- **User interface**: Ajout du statut `pending` aux statuts possibles

## Exemples de Cas d'Usage

### Cas 1: Nouvel Employé
1. Nouvel employé remplit le formulaire d'inscription
2. Employé reçoit message: "En attente d'approbation"
3. Admin approuve l'employé avec le rôle "manager"
4. Employé peut maintenant se connecter avec ses permissions de manager

### Cas 2: Changement de Poste
1. Admin va dans "Gestion des Utilisateurs" → "Utilisateurs Actifs"
2. Admin clique "Modifier le rôle" pour l'employé
3. Admin change le rôle de "manager" à "treasurer"
4. Permissions mises à jour automatiquement
5. Employé accède maintenant aux nouvelles fonctionnalités

### Cas 3: Rejet d'Inscription
1. Admin voit un utilisateur en attente
2. Admin clique "✗ Rejeter"
3. Utilisateur est supprimé de la base de données
4. Utilisateur doit créer un nouveau compte pour rejoindre l'entreprise

## Accès pour la Démo

Utiliser le compte admin pour tester:
- **Email**: admin@techtunisie.tn
- **Mot de passe**: password123
- **Entreprise**: TechTunisie Solutions

Puis aller à **Admin → Gestion des Utilisateurs** pour voir l'interface.
