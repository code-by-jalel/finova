# 🧪 Guide Complet de Test - FINOVA

## 📋 Table des Matières
1. [Configuration d'Accès](#configuration-daccès)
2. [Démarrage de l'Application](#démarrage-de-lapplication)
3. [Test des Features Principales](#test-des-features-principales)
4. [Test des Features Avancées](#test-des-features-avancées)
5. [Test des Permissions](#test-des-permissions)
6. [Checklist de Test](#checklist-de-test)

---

## 🔐 Configuration d'Accès

### Utilisateurs de Test Disponibles

#### TechCorp International (comp_1)
```
Email: treasurer@techcorp.fr
Mot de passe: password123
Rôle: Treasurer (Trésorier)
Permissions: Complètes
```

```
Email: manager@techcorp.fr
Mot de passe: password123
Rôle: Manager
Permissions: Restreintes
```

```
Email: accountant@techcorp.fr
Mot de passe: password123
Rôle: Accountant (Comptable)
Permissions: View & Reports
```

#### LogisticPro Solutions (comp_2)
```
Email: admin@logisticpro.fr
Mot de passe: admin123
Rôle: Admin
Permissions: Accès complet
```

---

## 🚀 Démarrage de l'Application

### 1. Installation des dépendances
```bash
npm install
```

### 2. Démarrage complet (API + Frontend)
```bash
npm run start:dev
```

Cela va:
- Démarrer JSON-Server sur **http://localhost:3000**
- Démarrer Angular Dev Server sur **http://localhost:4200**

### 3. Accès à l'application
```
URL: http://localhost:4200
```

### 4. Vérifier que les serveurs tournent
```bash
# Terminal 1: Vérifier API
curl http://localhost:3000/companies

# Terminal 2: Vérifier Frontend
npm start
```

---

## ✅ Test des Features Principales

### Feature 1: Authentification

#### Test 1.1: Login Valide
1. Aller à `http://localhost:4200`
2. Entrer l'email: `treasurer@techcorp.fr`
3. Entrer le mot de passe: `password123`
4. Cliquer "Connexion"
5. **Résultat attendu**: Redirection vers le dashboard

#### Test 1.2: Login Invalide
1. Entrer email: `fake@example.com`
2. Entrer mot de passe: `wrongpassword`
3. Cliquer "Connexion"
4. **Résultat attendu**: Message d'erreur "Identifiants invalides"

#### Test 1.3: Logout
1. Être connecté en tant que treasurer
2. Cliquer sur le menu utilisateur (en haut à droite)
3. Cliquer "Déconnexion"
4. **Résultat attendu**: Redirection vers login

### Feature 2: Dashboard

#### Test 2.1: Affichage Dashboard
1. Se connecter en tant que `treasurer@techcorp.fr`
2. **Résultat attendu**:
   - Voir le titre "Dashboard"
   - Voir les statistiques (soldes, nombre de transactions, etc.)
   - Voir les graphiques (si disponibles)
   - Voir les dernières transactions

#### Test 2.2: Accès au Sidebar
1. Vérifier que le menu latéral affiche:
   - Dashboard
   - Transactions
   - Wallets
   - Budgets
   - Suppliers (Admin)
   - Reports
   - Alerts
   - Audit Log

### Feature 3: Gestion des Wallets

#### Test 3.1: Voir la Liste des Wallets
1. Cliquer sur "Wallets" dans le menu
2. **Résultat attendu**:
   - Voir la liste: "Trésorerie Opérationnelle", "Épargne Stratégique", "Fonds Clients"
   - Voir les soldes pour chaque wallet
   - Voir le type de wallet

#### Test 3.2: Détail du Wallet
1. Cliquer sur "Trésorerie Opérationnelle"
2. **Résultat attendu**:
   - Voir le nom: "Trésorerie Opérationnelle"
   - Voir le solde: 50000 EUR
   - Voir la description: "Compte principal pour les opérations quotidiennes"
   - Voir l'historique des transactions associées
   - Voir la date de création

#### Test 3.3: Historique des Transactions du Wallet
1. Dans le détail du wallet
2. Scroller vers le bas pour voir la section "Historique des Transactions"
3. **Résultat attendu**:
   - Voir la table avec colonnes: Date, Description, Type, Status, Montant
   - Voir les transactions filtrées pour ce wallet (ex: tx_1, tx_2, tx_3)
   - Voir les statuts avec badges colorés
   - Les transactions triées par date (plus récentes d'abord)

### Feature 4: Transactions

#### Test 4.1: Voir la Liste des Transactions
1. Cliquer sur "Transactions" dans le menu
2. **Résultat attendu**:
   - Voir la liste de toutes les transactions
   - Voir les colonnes: Date, Description, Type, Status, Montant
   - Voir les statuts avec couleurs différentes

#### Test 4.2: Filtrer par Status
1. Dans la liste des transactions
2. Voir le dropdown "Filtrer par Status"
3. Sélectionner "Pending"
4. **Résultat attendu**:
   - Voir seulement les transactions en status "pending"
   - Exemple: tx_4 (Salaires) et tx_7 (Équipements)

#### Test 4.3: Filtrer par Type
1. Voir le dropdown "Filtrer par Type"
2. Sélectionner "expense"
3. **Résultat attendu**:
   - Voir seulement les transactions de type "expense"

#### Test 4.4: Filtrer par Plage de Date
1. Voir les champs "De" et "À"
2. Sélectionner une plage: De: 2025-11-01 À: 2025-12-05
3. **Résultat attendu**:
   - Voir seulement les transactions dans cette plage
   - Transactions affichées: tx_1 à tx_9

#### Test 4.5: Recherche
1. Dans le champ "Recherche"
2. Taper: "Facture"
3. **Résultat attendu**:
   - Voir les transactions avec "Facture" dans la description

### Feature 5: Approbation des Transactions

#### Test 5.1: Approuver une Transaction Pending
1. Se connecter en tant que `treasurer@techcorp.fr`
2. Aller dans "Transactions"
3. Filtrer par Status = "Pending"
4. Voir la transaction tx_4 (Salaires - 8000€)
5. Cliquer le bouton "✓ Approuver"
6. Confirmer dans la dialog
7. **Résultat attendu**:
   - Spinner de chargement
   - Transaction passe à status "confirmed"
   - Message de succès

#### Test 5.2: Rejeter une Transaction Pending
1. Voir la transaction tx_7 (Équipements - 12000€)
2. Cliquer le bouton "✗ Rejeter"
3. Confirmer dans la dialog
4. **Résultat attendu**:
   - Transaction passe à status "rejected"
   - Le montant revient au wallet

#### Test 5.3: Marquer comme Payée
1. Voir une transaction en status "confirmed"
2. Exemple: tx_2 (Fournitures - 2500€)
3. Cliquer le bouton "💳 Marquer comme Payée"
4. Confirmer
5. **Résultat attendu**:
   - Status passe à "paid"
   - paidDate se remplit

#### Test 5.4: Permissions - Manager ne peut pas approuver
1. Déconnecter
2. Se connecter en tant que `manager@techcorp.fr`
3. Aller dans "Transactions"
4. **Résultat attendu**:
   - Les boutons "Approuver", "Rejeter", "Marquer comme Payée" ne sont PAS visibles
   - Message: "Vous n'avez pas la permission"

### Feature 6: Budgets

#### Test 6.1: Voir la Liste des Budgets
1. Cliquer sur "Budgets" dans le menu
2. **Résultat attendu**:
   - Voir la liste des budgets
   - Voir pour chaque budget:
     - Département
     - Catégorie
     - Limite
     - Dépensé
     - Pourcentage utilisé
     - Status (healthy/warning/exceeded)

#### Test 6.2: Budget Status Colors
1. Voir le budget "Services Externes"
2. **Résultat attendu**:
   - Statut "warning" (23% utilisé)
   - Badge orange

#### Test 6.3: Détail du Budget
1. Cliquer sur un budget
2. **Résultat attendu**:
   - Voir les détails complets
   - Voir les transactions associées

### Feature 7: Suppliers (Admin Only)

#### Test 7.1: Voir la Liste des Suppliers
1. Cliquer sur "Suppliers" dans le menu (admin only)
2. **Résultat attendu**:
   - Voir la liste: "TechSupply Inc.", "CloudServices Ltd", "Équipement Pro Ltd"
   - Voir les détails: email, téléphone, adresse

#### Test 7.2: Détail Supplier
1. Cliquer sur "TechSupply Inc."
2. **Résultat attendu**:
   - Voir tous les détails
   - Voir les transactions associées
   - Voir le compte manager

#### Test 7.3: Ajouter un Supplier (si implémenté)
1. Cliquer le bouton "Ajouter Supplier"
2. Remplir le formulaire avec:
   - Nom: "New Supplier"
   - Email: "new@supplier.com"
   - Téléphone: "+33612345678"
   - Adresse, ville, code postal
   - Conditions de paiement
3. Cliquer "Enregistrer"
4. **Résultat attendu**:
   - Le nouveau supplier apparaît dans la liste

#### Test 7.4: Permission - Manager ne peut pas accéder
1. Déconnecter
2. Se connecter en tant que `manager@techcorp.fr`
3. **Résultat attendu**:
   - "Suppliers" n'est pas visible dans le menu
   - Si on essaie d'accéder à `/admin/suppliers`, redirection vers dashboard

---

## 🎯 Test des Features Avancées

### Feature 8: Alertes Dashboard

#### Test 8.1: Voir les Alertes
1. Cliquer sur "Alerts" dans le menu
2. **Résultat attendu**:
   - Voir la liste des alertes
   - Voir 4 alertes:
     - "Solde trésorerie faible" (warning)
     - "Budget dépassement risque" (warning)
     - "Facture en attente d'approbation" (info)
     - "Facture impayée en retard" (danger)

#### Test 8.2: Filtrer par Sévérité
1. Voir le dropdown "Filtrer par Sévérité"
2. Sélectionner "danger"
3. **Résultat attendu**:
   - Voir seulement l'alerte "Facture impayée en retard"

#### Test 8.3: Marquer comme Lue
1. Cliquer sur une alerte
2. Voir le bouton "✓ Marquer comme lue"
3. Cliquer
4. **Résultat attendu**:
   - L'alerte n'a plus le badge "Unread"
   - Badge "3 non lues" au lieu de "4 non lues"

#### Test 8.4: Supprimer une Alerte
1. Cliquer le bouton "✕ Supprimer"
2. **Résultat attendu**:
   - L'alerte disparaît de la liste

#### Test 8.5: Marquer tout comme lu
1. Cliquer le bouton "Tout marquer comme lu"
2. **Résultat attendu**:
   - Aucune alerte n'a le badge "Unread"
   - Badge: "0 non lues"

### Feature 9: Audit Log

#### Test 9.1: Voir le Journal d'Audit
1. Cliquer sur "Audit Log" dans le menu
2. **Résultat attendu**:
   - Voir la table avec colonnes: Timestamp, Action, User, Resource, Changes, IP
   - Voir les entrées:
     - CREATE_TRANSACTION (tx_1)
     - APPROVE_TRANSACTION (tx_2)

#### Test 9.2: Filtrer par Action
1. Voir le dropdown "Filtrer par Action"
2. Sélectionner "APPROVE_TRANSACTION"
3. **Résultat attendu**:
   - Voir seulement les approbations

#### Test 9.3: Recherche
1. Taper dans "Rechercher par ressource": "tx_1"
2. **Résultat attendu**:
   - Voir les actions liées à tx_1

#### Test 9.4: Pagination
1. Si plus de 10 entrées, voir les boutons "Précédent" et "Suivant"
2. Cliquer "Suivant"
3. **Résultat attendu**:
   - Voir les entrées 11-20

### Feature 10: Rapports

#### Test 10.1: Voir l'Interface des Rapports
1. Cliquer sur "Reports" dans le menu
2. **Résultat attendu**:
   - Voir 4 cartes de rapport:
     1. Transactions CSV
     2. Budgets CSV
     3. Financial Summary
     4. JSON Export
   - Voir les statistiques:
     - Nombre de transactions
     - Nombre de budgets
     - Solde total
     - Revenus totaux

#### Test 10.2: Exporter Transactions en CSV
1. Cliquer le bouton "📥 Télécharger CSV" sur la carte "Transactions"
2. **Résultat attendu**:
   - Fichier `transactions.csv` téléchargé
   - Contient les colonnes: Date, Description, Type, Status, Amount, Currency
   - Contient toutes les transactions

#### Test 10.3: Exporter Budgets en CSV
1. Cliquer le bouton "📥 Télécharger CSV" sur la carte "Budgets"
2. **Résultat attendu**:
   - Fichier `budgets.csv` téléchargé
   - Contient les colonnes: Department, Category, Month, Limit, Spent, Forecast, Status

#### Test 10.4: Exporter Financial Summary
1. Cliquer le bouton "📄 Générer" sur la carte "Financial Summary"
2. **Résultat attendu**:
   - Fichier `financial_summary.txt` téléchargé
   - Contient un résumé en texte formaté

#### Test 10.5: Exporter JSON Complet
1. Cliquer le bouton "💾 Exporter JSON" sur la carte "JSON Export"
2. **Résultat attendu**:
   - Fichier `finova_export.json` téléchargé
   - Contient toutes les données (transactions, budgets, wallets)

#### Test 10.6: Rafraîchir les Données
1. Cliquer le bouton "🔄 Rafraîchir"
2. **Résultat attendu**:
   - Les statistiques se mettent à jour
   - Les chiffres correspondent aux données actuelles

---

## 🔑 Test des Permissions

### Matrice de Permissions

| Feature | Treasurer | Manager | Accountant | Admin |
|---------|-----------|---------|------------|-------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Wallets - View | ✅ | ⚠️* | ✅ | ✅ |
| Transactions - View | ✅ | ⚠️* | ✅ | ✅ |
| Transactions - Approve | ✅ | ❌ | ❌ | ✅ |
| Transactions - Reject | ✅ | ❌ | ❌ | ✅ |
| Budgets - Manage | ✅ | ❌ | ⚠️* | ❌ |
| Suppliers - Manage | ✅ | ❌ | ❌ | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ |
| Alerts | ✅ | ✅ | ✅ | ✅ |
| Audit Log | ✅ | ❌ | ✅ | ✅ |

*⚠️ = Vue restreinte (données propres)
*❌ = Accès refusé

### Test 10.1: Permissions Treasurer
1. Se connecter en tant que `treasurer@techcorp.fr`
2. **Résultat attendu**:
   - Accès à tous les menus
   - Peut approuver/rejeter les transactions
   - Peut gérer les suppliers

### Test 10.2: Permissions Manager
1. Se connecter en tant que `manager@techcorp.fr`
2. **Résultat attendu**:
   - "Suppliers" absent du menu
   - "Audit Log" absent du menu
   - Boutons d'approbation non visibles
   - Peut voir seulement ses propres wallets

### Test 10.3: Permissions Accountant
1. Se connecter en tant que `accountant@techcorp.fr`
2. **Résultat attendu**:
   - "Suppliers" absent du menu
   - Peut exporter les données
   - "Budgets" absent du menu

### Test 10.4: Accès Non Autorisé
1. Se connecter en tant que `manager@techcorp.fr`
2. Essayer d'accéder à `/admin/suppliers`
3. **Résultat attendu**:
   - Redirection vers dashboard
   - Message: "Accès refusé"

---

## 📊 Checklist de Test

### Phase 1: Configuration (15 min)
- [ ] npm install exécuté
- [ ] npm run start:dev démarré
- [ ] API sur port 3000 accessible
- [ ] Frontend sur port 4200 accessible
- [ ] db.json contient les données de test

### Phase 2: Authentification (10 min)
- [ ] Login réussie avec treasurer@techcorp.fr
- [ ] Login échouée avec identifiants invalides
- [ ] Logout fonctionne
- [ ] Session persistante après refresh

### Phase 3: Navigation (10 min)
- [ ] Dashboard s'affiche correctement
- [ ] Menu latéral complet
- [ ] Tous les liens de navigation fonctionnent
- [ ] Breadcrumbs affichés

### Phase 4: Wallets (15 min)
- [ ] Liste des wallets affichée
- [ ] Détail du wallet complet
- [ ] Historique des transactions visible
- [ ] Montants correctes
- [ ] Soldes mis à jour après transactions

### Phase 5: Transactions (30 min)
- [ ] Liste des transactions affichée
- [ ] Filtrage par status fonctionne (4/4 status testés)
- [ ] Filtrage par type fonctionne (5/5 types testés)
- [ ] Filtrage par date fonctionne
- [ ] Recherche fonctionne
- [ ] Approbation réussie
- [ ] Rejet réussie
- [ ] Marquer comme payée réussie
- [ ] Statut change dans la liste

### Phase 6: Budgets (10 min)
- [ ] Liste des budgets affichée
- [ ] Détail du budget complet
- [ ] Pourcentages calculés correctement
- [ ] Status colors affichés
- [ ] Transactions associées listées

### Phase 7: Suppliers (10 min)
- [ ] Liste des suppliers affichée
- [ ] Détail du supplier complet
- [ ] Transactions associées listées
- [ ] Menu "Suppliers" visible seulement pour treasurer/admin

### Phase 8: Alerts (15 min)
- [ ] Liste des alertes affichée
- [ ] 4 alertes présentes
- [ ] Filtrage par sévérité fonctionne
- [ ] Marquer comme lu fonctionne
- [ ] Supprimer fonctionne
- [ ] Compteur "non lues" correct

### Phase 9: Audit Log (10 min)
- [ ] Journal d'audit affichée
- [ ] Actions listées correctement
- [ ] Filtrage par action fonctionne
- [ ] Recherche fonctionne
- [ ] Pagination fonctionne

### Phase 10: Reports (20 min)
- [ ] 4 cartes de rapport affichées
- [ ] Statistiques correctes
- [ ] CSV Transactions téléchargé et valide
- [ ] CSV Budgets téléchargé et valide
- [ ] Financial Summary téléchargé
- [ ] JSON Export téléchargé et complet
- [ ] Rafraîchir fonctionne

### Phase 11: Permissions (20 min)
- [ ] Treasurer a accès complet
- [ ] Manager n'a pas accès à Suppliers
- [ ] Manager n'a pas accès à Audit Log
- [ ] Manager ne peut pas approuver
- [ ] Accountant peut exporter
- [ ] Redirection d'accès non autorisé fonctionne

### Phase 12: Isolation Multi-Tenant (15 min)
- [ ] Treasurer ne voit que les données de comp_1
- [ ] Admin ne voit que les données de comp_2
- [ ] Les wallets sont isolés par company
- [ ] Les transactions sont isolées par company
- [ ] Les budgets sont isolés par company

---

## 🐛 Dépannage

### Problème: Authentification échouée
```
Solution:
1. Vérifier que db.json existe et contient les utilisateurs
2. Vérifier que l'API JSON-Server est en cours d'exécution
3. Vérifier l'email et le mot de passe (case-sensitive)
```

### Problème: Données non chargées
```
Solution:
1. Vérifier la console browser (F12)
2. Vérifier que l'API sur localhost:3000 répond
3. Redémarrer npm run start:dev
4. Vider le cache du navigateur
```

### Problème: Boutons d'approbation non visibles
```
Solution:
1. Vérifier que vous êtes connecté en tant que treasurer
2. Vérifier que la transaction est en status "pending"
3. Vérifier que la permission "approve_high" existe
4. Vérifier la console pour les erreurs
```

### Problème: Rapports ne téléchargent pas
```
Solution:
1. Vérifier les paramètres du navigateur (bloqueur de pop-ups)
2. Vérifier que ReportService est injecté
3. Vérifier la console pour les erreurs
4. Vérifier que les données existent (transactions, budgets)
```

---

## 📞 Support

Pour toute question ou problème:
1. Vérifier les logs dans la console browser (F12)
2. Vérifier les logs du terminal (npm run start:dev)
3. Vérifier que tous les services sont injectés correctement
4. Vérifier que les permissions sont correctement définies

---

## ✨ Cas d'Usage Complet

### Scénario 1: Approuver une Dépense (10 min)
1. Se connecter en tant que `treasurer@techcorp.fr`
2. Aller dans Transactions
3. Voir la transaction tx_4 "Salaires" (8000€, pending)
4. Cliquer "Approuver"
5. Confirmer
6. **Résultat**: Status change à "confirmed"
7. Aller dans Budgets
8. Voir le budget "Salaires" (20000€ limite, 0€ dépensé)
9. **Résultat**: Le montant de la transaction sera reflété au prochain calcul
10. Aller dans Reports
11. Télécharger le CSV des transactions
12. **Résultat**: Voir la transaction avec status "confirmed"

### Scénario 2: Générer un Rapport Financier (15 min)
1. Se connecter en tant que `accountant@techcorp.fr`
2. Aller dans Reports
3. Voir les statistiques:
   - 10 transactions
   - 6 budgets
   - Solde total: 275000 EUR
   - Revenus totaux: 45000 EUR
4. Exporter en CSV (Transactions)
5. Exporter en CSV (Budgets)
6. Exporter en JSON complet
7. Ouvrir les fichiers dans Excel/JSON viewer
8. **Résultat**: Tous les fichiers contiennent les données correctes

### Scénario 3: Monitorer les Alertes (10 min)
1. Se connecter en tant de `treasurer@techcorp.fr`
2. Aller dans Alerts
3. Voir 4 alertes (1 danger, 2 warning, 1 info)
4. Filtrer par "danger"
5. Voir l'alerte "Facture impayée en retard"
6. Cliquer "Approuver Transaction" (if available)
7. Marquer l'alerte comme lue
8. **Résultat**: Alerte n'a plus le badge "Unread"
9. Aller dans Transactions
10. Trouver et payer la transaction associée
11. Retour à Alerts
12. **Résultat**: L'alerte disparaît ou change de status

---

## 🎊 Conclusion

Votre projet FINOVA est maintenant prêt pour la production! Tous les tests ci-dessus doivent passer pour garantir la qualité.

**Temps total estimé**: 3-4 heures pour tous les tests
**Priorité**:
1. Authentification (obligatoire)
2. Transactions (core feature)
3. Approbations (core feature)
4. Permissions (sécurité)
5. Rapports (fonctionnalité avancée)

Bonne chance! 🚀
