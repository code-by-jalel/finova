# 🎉 Finova Migration Complète - Guide de Test

## ✅ État Actuel

L'application **Finova** est maintenant complètement migrée vers une architecture multi-utilisateurs avec JSON-Server!

### Serveurs Actifs

- **Frontend (Angular)**: http://localhost:4201
- **Backend (JSON-Server)**: http://localhost:3000/
- **DB Explorer**: http://localhost:3000/db (optionnel)

## 🚀 Test Multi-Utilisateurs

### Utilisateurs de Test

#### User 1 (Test)
```
Email: test@finova.fr
Password: password123
```

#### User 2 (Admin)
```
Email: admin@finova.fr
Password: admin123
```

### Scénario de Test #1: Isolation des Données

1. **Ouvrir l'application**
   - Accéder à: http://localhost:4201
   - Vous devriez voir la page de login

2. **Connexion User 1**
   ```
   Email: test@finova.fr
   Password: password123
   ```
   - Cliquer sur "Login"
   - Redirection vers Dashboard

3. **Vérifier les données User 1**
   - Aller à "Transactions"
   - Vous devriez voir:
     - Salaire 3000€ (2025-12-03)
     - Netflix 15€ (2025-12-02)
     - Carburant 50€ (2025-12-01)

4. **Créer une nouvelle transaction**
   - Cliquer sur "Nouvelle Transaction"
   - Type: Dépense
   - Catégorie: Achats
   - Montant: 75€
   - Description: "Test User 1"
   - Sauvegarder
   - ✅ Transaction créée = Données synchronisées

5. **Créer un budget**
   - Aller à "Budgets"
   - Cliquer "Nouveau Budget"
   - Catégorie: Achats
   - Limite: 300€
   - Sauvegarder

6. **Déconnexion**
   - Cliquer sur avatar/logout
   - Confirmez la déconnexion

### Scénario de Test #2: Multi-Utilisateurs

1. **Connexion User 2**
   ```
   Email: admin@finova.fr
   Password: admin123
   ```

2. **Vérifier l'isolation des données**
   - Aller à "Transactions"
   - ❌ Vous ne devriez PAS voir les transactions de User 1
   - ❌ Vous ne devriez voir QUE les données de User 2
   - Les données de User 1 sont INVISIBLES ✅

3. **Créer des données User 2**
   - Ajouter une transaction: "Test Admin User - 500€"
   - Ajouter un budget: "Maintenance - 250€"

4. **Vérifier db.json**
   - Ouvrir http://localhost:3000/
   - Cliquer sur `/transactions`
   - Vérifier que chaque transaction a un `userId` correct:
     - User 1: `"userId": "1"`
     - User 2: `"userId": "2"`

5. **Reconnecter User 1**
   - Déconnecter User 2
   - Se reconnecter avec User 1
   - Vérifier ses données + la nouvelle transaction créée
   - ❌ Les données de User 2 sont INVISIBLES

## 📊 Vérifications API

### 1. Authentification
```
GET /users?email=test@finova.fr
```
Répond avec:
```json
[
  {
    "id": "1",
    "email": "test@finova.fr",
    "password": "password123",
    "name": "Test User"
  }
]
```

### 2. Transactions (filtré par userId)
```
GET /transactions?userId=1
```
Retourne UNIQUEMENT les transactions avec userId=1

### 3. Budgets (filtré par userId)
```
GET /budgets?userId=1
```
Retourne UNIQUEMENT les budgets avec userId=1

### 4. Fournisseurs (filtré par userId)
```
GET /suppliers?userId=1
```
Retourne UNIQUEMENT les fournisseurs avec userId=1

## 🔍 Tests de Fonctionnalité

### Transaction Management
- ✅ Créer transaction
- ✅ Lire transactions
- ✅ Éditer transaction
- ✅ Supprimer transaction
- ✅ Filtrer par type (income/expense)
- ✅ Filtrer par catégorie
- ✅ Rechercher par description

### Budget Management
- ✅ Créer budget
- ✅ Lire budgets
- ✅ Éditer budget
- ✅ Supprimer budget
- ✅ Voir % utilisation
- ✅ Alerte dépassement

### Dashboard
- ✅ Voir total balance
- ✅ Voir revenus vs dépenses
- ✅ Voir graphiques
- ✅ Voir croissance revenu
- ✅ Voir dépenses par catégorie

### Suppliers
- ✅ Créer fournisseur
- ✅ Lire fournisseurs
- ✅ Éditer fournisseur
- ✅ Supprimer fournisseur
- ✅ Rechercher par nom/email/ville

### Authentication
- ✅ Login email/password
- ✅ Stockage du token
- ✅ Logout
- ✅ Redirection authentifiée
- ✅ Récupération userId courant

## 🐛 Dépannage

### Problème: "Port already in use"
```bash
# Arrêter le processus sur le port
netstat -ano | findstr :4201
taskkill /PID <PID> /F
```

### Problème: "Cannot connect to http://localhost:3000"
```bash
# Vérifier que json-server est actif
cd finova
npx json-server --watch db.json --port 3000
```

### Problème: "API calls failing"
1. Vérifier que http://localhost:3000 est actif
2. Vérifier que db.json est valide JSON
3. Vérifier la console du navigateur (F12 > Network tab)

### Problème: "404 Not Found" sur routes
- Vérifier que le AuthGuard laisse passer les utilisateurs authentifiés
- Vérifier localStorage pour le token

## 📱 Architecture Actuelle

```
┌─────────────────────────────────────┐
│   Frontend Angular 16               │
│   http://localhost:4201             │
│                                     │
│  Components (Observables)           │
│  Services (HttpClient)              │
│  AuthGuard, Routes                  │
└────────────────┬────────────────────┘
                 │
                 │ HTTP REST API
                 │ (Bearer Token)
                 ▼
┌─────────────────────────────────────┐
│   Backend JSON-Server               │
│   http://localhost:3000             │
│                                     │
│  db.json                            │
│  - users (2 utilisateurs)           │
│  - transactions (filtré userId)     │
│  - budgets (filtré userId)          │
│  - suppliers (filtré userId)        │
└─────────────────────────────────────┘
```

## 📝 Notes Importantes

### Sécurité
- ⚠️ Les mots de passe sont stockés en clair (pour démo)
- ⚠️ Le token est stocké en localStorage (OK pour démo)
- En production: Hasher mots de passe + httpOnly cookies

### Scalabilité
- JSON-Server parfait pour prototypage/test
- Pour production: Migrer vers Node.js/Express/MongoDB
- Les requêtes API restent IDENTIQUES

### Multi-Device
- Ouvrir http://localhost:4201 sur 2 navigateurs
- Tester la synchronisation en temps réel
- User 1 crée transaction → User 2 recharge → données synchronisées

## 🎯 Critères de Succès

✅ **Réussi** si:
1. User 1 peut créer/modifier/supprimer données
2. User 2 ne voit PAS les données de User 1
3. Les données persistent après logout/login
4. Les transactions HTTP fonctionnent (inspecteur F12)
5. Le Dashboard charge les données correctement
6. Les graphiques affichent les données justes

❌ **Échoué** si:
1. Les données fuient entre utilisateurs
2. Les transactions ne persistent pas
3. API retourne erreur 500
4. Composants affichent erreur Observable
5. Authentification bypass

## 📚 Documentation Complète

Voir les fichiers:
- `MIGRATION_COMPLETE.md` - Résumé de la migration
- `ARCHITECTURE_EXPLIQUEE.md` - Architecture détaillée
- `FINOVA_APP_GUIDE.md` - Guide utilisateur app

---

## 🚀 Commandes Utiles

### Démarrer tout
```bash
npm run start:dev
```

### Démarrer backend seul
```bash
npx json-server --watch db.json --port 3000
```

### Démarrer frontend seul
```bash
ng serve --port 4201
```

### Build production
```bash
ng build
```

### Editer db.json directement
```bash
# L'application se rafraîchira automatiquement!
# JSON-Server watch = Hot reload
```

---

## 💡 Conseil: Outils de Test

### Postman (tester API directement)
```
GET http://localhost:3000/transactions?userId=1
Headers: Authorization: Bearer token_1_...
```

### VS Code REST Client
```
GET http://localhost:3000/transactions?userId=1
Authorization: Bearer token_1_...
```

### DevTools Chrome (Network Tab)
- F12 → Network → Voir les requêtes HTTP
- Inspect → Console → Voir les logs

---

**Ready to test!** 🎉

Accédez à http://localhost:4201 et commencez!
