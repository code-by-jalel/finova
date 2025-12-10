# 🚀 Setup FINOVA sur un Nouvel Ordinateur

## Étape 1: Cloner le Repository

```bash
git clone https://github.com/yourusername/finova.git
cd finova
```

---

## Étape 2: Installer les Dépendances

```bash
npm install
```

Cela va télécharger:
- ✅ Angular 17
- ✅ RxJS
- ✅ TypeScript
- ✅ Tous les packages du `package.json`

---

## Étape 3: Vérifier que JSON-Server est Installé

### Option A: Installer localement (RECOMMANDÉ)

```bash
npm install json-server --save-dev
```

Cela ajoute JSON-Server comme dépendance du projet.

### Option B: Installer globalement

```bash
npm install -g json-server
```

---

## Étape 4: Ajouter des Scripts NPM (Si pas déjà fait)

Vérifiez votre `package.json`:

```json
{
  "scripts": {
    "start": "ng serve",
    "dev": "concurrently \"ng serve\" \"json-server db.json\""
  },
  "devDependencies": {
    "json-server": "^0.17",
    "concurrently": "^8"
  }
}
```

Si ce n'est pas fait, installez `concurrently`:

```bash
npm install concurrently --save-dev
```

---

## Étape 5: Lancer l'Application

### Option 1: Deux Terminaux Séparés (SIMPLE)

**Terminal 1: Frontend**
```bash
npm start
```
Accessible sur: `http://localhost:4200`

**Terminal 2: Backend API**
```bash
json-server db.json
```
API sur: `http://localhost:3000`

### Option 2: Tout dans Un Terminal (FACILE)

```bash
npm run dev
```

Cela lance Frontend + Backend en parallèle.

---

## ✅ Checklist de Setup

- [ ] `git clone` le repository
- [ ] `npm install` pour les dépendances
- [ ] `npm install json-server --save-dev` si nécessaire
- [ ] Vérifier que les ports 4200 et 3000 sont libres
- [ ] Lancer `npm start` (frontend)
- [ ] Lancer `json-server db.json` (backend) dans un autre terminal
- [ ] Ouvrir `http://localhost:4200` dans le navigateur

---

## 🔐 Credentials de Test

Après le setup, connectez-vous avec:

### TechTunisie Solutions (comp_1)
```
Email: admin@techtunisie.tn
Password: password123
```

### TransportPro Tunisie (comp_2)
```
Email: admin@transportpro.tn
Password: admin123
```

---

## 🧪 Tester le Système d'Approbation

1. Allez à `/auth/signup`
2. Créez un nouvel utilisateur:
   - Nom: `Nouveau User`
   - Email: `newuser@company.tn`
   - Entreprise: TechTunisie
   - Mot de passe: `password123`
3. Tentez de vous connecter → ❌ "En attente d'approbation"
4. Connectez-vous en tant qu'admin
5. Allez à `Admin → Gestion Utilisateurs`
6. Approuvez le nouvel utilisateur
7. Le nouvel utilisateur peut maintenant se connecter ✅

---

## 🐛 Troubleshooting

### Erreur: "Port 4200 déjà utilisé"
```bash
# Changez le port
ng serve --port 4201
```

### Erreur: "Port 3000 déjà utilisé"
```bash
# Changez le port pour JSON-Server
json-server db.json --port 3001
# ET mettez à jour l'URL dans les services
```

### Erreur: "Module not found: @angular/..."
```bash
# Réinstallez les dépendances
rm -rf node_modules
npm install
```

### Les données ne se sauvegardent pas
- Vérifiez que `db.json` existe dans le dossier racine
- JSON-Server doit être en cours d'exécution
- Vérifiez que l'API répond: `http://localhost:3000/users`

---

## 📊 Architecture du Backend

L'application utilise **JSON-Server** pour simuler une API REST:

```
db.json (Base de données)
  ├── companies     (Entreprises)
  ├── users         (Utilisateurs)
  ├── wallets       (Portefeuilles)
  ├── transactions  (Transactions)
  ├── budgets       (Budgets)
  ├── suppliers     (Fournisseurs)
  ├── clients       (Clients)
  ├── alerts        (Alertes)
  └── auditLog      (Audit)
```

Chaque collection est accessible via HTTP:
```
GET    /users               → Récupère tous les users
GET    /users/:id           → Récupère un user
POST   /users               → Crée un user
PATCH  /users/:id           → Modifie un user
DELETE /users/:id           → Supprime un user
```

---

## 🔧 Configuration Importante

### URL de l'API

Tous les services utilisent: `http://localhost:3000`

Si vous changez le port, mettez à jour dans les services:
```typescript
private apiUrl = 'http://localhost:3000';
```

### Variables d'Environnement (Optionnel)

Créez `src/environments/environment.ts`:
```typescript
export const environment = {
  apiUrl: 'http://localhost:3000',
  production: false
};
```

Puis utilisez:
```typescript
import { environment } from '../../environments/environment';

export class UserService {
  private apiUrl = environment.apiUrl;
  ...
}
```

---

## 📦 Fichiers Importants

```
finova/
├── package.json              ← Dépendances et scripts
├── angular.json              ← Configuration Angular
├── tsconfig.json             ← Configuration TypeScript
├── db.json                   ← Base de données
├── src/
│   ├── app.module.ts         ← Module principal (HttpClientModule)
│   ├── app-routing.module.ts ← Routes
│   └── app/
│       ├── core/services/    ← API calls
│       └── modules/          ← Fonctionnalités
```

---

## ✨ Après le Setup

Une fois tout lancé, vous pouvez:

✅ Créer des comptes utilisateurs
✅ Approuver les utilisateurs (admin)
✅ Gérer les fournisseurs
✅ Créer des transactions
✅ Gérer les budgets
✅ Voir les rapports

---

## 🚨 Points Importants

⚠️ **JSON-Server doit toujours être actif**
- Sans lui, les appels API échoueront
- Gardez le terminal avec `json-server` ouvert

⚠️ **Ne pas modifier db.json manuellement en production**
- C'est une base de données JSON simple
- En production, utiliseriez une vraie DB (PostgreSQL, MongoDB, etc.)

⚠️ **Les données sont stockées localement**
- Si vous supprimez `db.json`, tout est perdu
- Faites des backups si nécessaire

---

## 📞 Questions Courantes

**Q: Pourquoi deux terminaux?**
A: Angular frontend et JSON-Server backend sont deux serveurs différents.

**Q: Puis-je utiliser une vraie base de données?**
A: Oui! Remplacez JSON-Server par Express.js + PostgreSQL/MongoDB.

**Q: Comment déployer en production?**
A: 
1. Build: `ng build --prod`
2. Déployez le dossier `dist/` sur un serveur
3. Configurez une vraie API backend (Node.js, Python, etc.)

**Q: Les données persistent-elles?**
A: Oui, JSON-Server modifie `db.json`. Chaque changement est sauvegardé.

---

**Dernière mise à jour:** 10 Décembre 2025
**Version:** 1.0
**Status:** ✅ Production Ready
