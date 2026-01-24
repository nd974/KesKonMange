# 🍽️ KesKonMange - Présentation du Projet

## 📋 Vue d'ensemble

**KesKonMange** est une application web et mobile collaborative qui révolutionne la gestion des repas et des stocks alimentaires au sein d'un foyer. Inspirée du modèle Netflix, elle permet à une famille ou un groupe de personnes de partager un compte commun avec plusieurs profils individuels, dans le but d'**organiser la cuisine et les courses de manière efficace et collaborative**.

---

## 🎯 Objectif Principal

Simplifier et optimiser la gestion quotidienne des repas en permettant :
- **La planification collaborative** des menus
- **La gestion des stocks** d'ingrédients
- **La génération automatique** de listes de courses
- **La recommandation intelligente** de recettes basées sur les ingrédients disponibles

---

## ✨ Intérêts & Fonctionnalités Clés

### 1. **Gestion Multi-Profils**
- Un compte par foyer avec plusieurs profils utilisateurs (type Netflix)
- Chaque profil possède ses préférences, favoris et historique

### 2. **Planification de Menus**
- Créer et gérer des menus sur un calendrier
- Gérer les inscriptions des profils aux menus avec indicateurs d'appétit :
  - 🤤 Grosse faim = 125% des ingrédients
  - 😊 Normal = 100% des ingrédients  
  - 🤏 Petit faim = 75% des ingrédients
- Calcul automatique des quantités d'ingrédients nécessaires

### 3. **Gestion des Stocks & Garde-Manger**
- Inventorier les ingrédients disponibles dans la maison
- Organiser les stocks par zones/espaces de rangement
- Mettre à jour les stocks facilement

### 4. **Recettes Intelligentes**
- Créer et gérer une base de recettes personnalisées ou communautaires
- **Recommandation autonome** : suggérer les recettes possibles avec les ingrédients en stock
- Ajouter des recettes aux menus avec un seul clic
- Système de notation des recettes
- Historique des inscriptions (suivi de popularité)

### 5. **Liste de Courses Automatisée**
- Génération automatique basée sur le menu et le stock manquant
- Suggestions d'achats groupés par budget défini (ex: buckets de 5€)
- Propositions de magasins pour trouver les meilleurs prix

### 6. **Système de Nutrition**
- Suivi nutritionnel des recettes :
  - Glucides, Protéines, Lipides, Alcool
  - Calcul automatique des calories :
    - Glucides : 4 kcal/g
    - Protéines : 4 kcal/g
    - Lipides : 9 kcal/g
    - Alcool : 7 kcal/g

### 7. **Notifications & Alertes**
- Notifications lors de l'inscription/désinscription aux menus
- Système de badges pour les notifications mobiles
- Alertes sur les stocks faibles

### 8. **Fonctionnalités Avancées**
- Lecteur de codes-barres pour ajouter des produits rapidement
- Intégration OpenFoodFacts pour données nutritionnelles
- Support des images pour ingrédients et ustensiles
- Système de rôles (Admin, Membre, Invité) avec permissions granulaires

---

## 🏗️ Architecture Technique

### **Frontend**
- **Framework** : React 18 + Vite
- **Routeur** : React Router v6
- **Requêtes HTTP** : React Query (@tanstack/react-query)
- **UI & Styles** : Tailwind CSS + Lucide React (icônes)
- **Stockage** : IndexedDB (idb) pour données offline
- **Notifications** : React Hot Toast
- **Cartes** : Leaflet + React-Leaflet (localisation magasins)
- **Codes-barres** : @zxing/library (scanner)
- **Auth** : Firebase
- **Date** : Dayjs

### **Backend**
- **Serveur** : Express.js
- **Base de données** : PostgreSQL
- **Auth** : Firebase Admin
- **Email** : SendGrid + Nodemailer
- **Stockage images** : Cloudinary
- **Cartes** : Leaflet + React-Leaflet
- **API externes** : OpenFoodFacts

### **DevOps**
- **Déploiement Frontend** : Vercel
- **CI/CD** : GitHub Actions avec workflows de maintenance
- **Développement** : Concurrently pour lancer backend + frontend ensemble

---

## 📁 Structure du Projet

```
KesKonMange/
├── backend/                          # API Express
│   ├── routes/
│   │   ├── home.js                  # Gestion des foyers
│   │   ├── profile.js               # Profils utilisateurs
│   │   ├── recipe.js                # Recettes
│   │   ├── menu.js                  # Menus et calendrier
│   │   ├── ingredient.js            # Ingrédients
│   │   ├── product.js               # Produits (stocks)
│   │   ├── storage.js               # Zones de rangement
│   │   ├── unit.js                  # Unités (kg, L, etc.)
│   │   ├── utensil.js               # Ustensiles de cuisine
│   │   ├── nutrition.js             # Données nutritionnelles
│   │   ├── tag.js                   # Tags/catégories
│   │   ├── shops.js                 # Magasins & géolocalisation
│   │   ├── notifications.js         # Système de notifications
│   │   ├── mailer.js                # Envoi d'emails
│   │   └── api/
│   │       └── openfoodfacts.js    # Intégration OpenFoodFacts
│   ├── utils/
│   │   ├── nutrition/               # Calculs nutritionnels
│   │   └── tags/                    # Web scrapping tags
│   ├── db.js                        # Configuration PostgreSQL
│   └── server.js                    # Serveur principal

└── frontend/                         # Application React
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx        # Tableau de bord principal
    │   │   ├── Calendar.jsx         # Calendrier & menus
    │   │   ├── Recipes.jsx          # Catalogue recettes
    │   │   ├── RecipeAdd.jsx        # Créer/éditer recette
    │   │   ├── Stock.jsx            # Garde-manger
    │   │   ├── ShoppingList.jsx     # Liste de courses
    │   │   ├── Notifications.jsx    # Centre notifications
    │   │   └── settings/            # Paramètres utilisateur
    │   ├── components/
    │   │   ├── Header.jsx           # En-tête
    │   │   ├── MobileNav.jsx        # Navigation mobile
    │   │   ├── RecipeCard.jsx       # Carte recette
    │   │   ├── BarCodeScanner.jsx   # Scanner codes-barres
    │   │   ├── TagTree.jsx          # Arborescence tags
    │   │   └── modals/              # Composants modaux
    │   ├── hooks/
    │   │   ├── useHome.js           # Logique foyer
    │   │   ├── useMenu.js           # Logique menus
    │   │   └── useProfile.js        # Logique profils
    │   ├── api/                     # Services API
    │   ├── config/
    │   │   ├── firebase.js          # Configuration Firebase
    │   │   └── constants.js         # Constantes
    │   └── lib/
    │       └── dayjs.js             # Configuration date/heure
    └── public/
        └── manifest.json            # PWA manifest

```

---

## 🚀 Technologies & Stack

| Aspect | Technologie |
|--------|------------|
| **Frontend Framework** | React 18 |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **API Client** | React Query |
| **Backend** | Express.js |
| **Database** | PostgreSQL |
| **Authentication** | Firebase |
| **Image Hosting** | Cloudinary |
| **Email Service** | SendGrid + Nodemailer |
| **Code Scanning** | @zxing/library |
| **Maps** | Leaflet |
| **Deployment** | Vercel (Frontend), Custom Server (Backend) |

---

## 📱 Expérience Utilisateur

### **Desktop**
- Interface complète avec tous les paramètres
- Vue calendrier optimisée
- Gestion avancée des menus

### **Mobile**
- Navigation bottom-tab
- Scans de codes-barres fluides
- Affichage des badges de notification
- Adaptabilité complète des formulaires

---

## 🎓 Points Innovants

✅ **Calcul intelligent des ingrédients** : Adaptation automatique selon l'appétit du profil  
✅ **Recommandations contextuelles** : Recettes basées sur stocks + budgets + magasins  
✅ **Système multi-utilisateurs** : Modèle Netflix appliqué à la cuisine  
✅ **Optimisation des courses** : Groupage par magasins et budgets prédéfinis  
✅ **Données nutritionnelles** : Suivi complet des apports nutritionnels  
✅ **Système de rôles** : Admin/Membre/Invité avec permissions granulaires  

---

## 🎯 Cas d'Usage Principal

> L'application connaît :
> - Les notes que vous avez données aux recettes
> - Votre historique d'inscriptions aux menus
> - Les stocks disponibles et leur coût
> - Les magasins où se les procurer
>
> **Vous dites** : "J'ai des carottes à cuisiner aujourd'hui"
>
> **L'application propose** :
> - Toutes les recettes avec carottes
> - Groupées par nombre de magasins à visiter
> - Triées par : moins cuisinées → mieux notées → moins chères
> - Avec les ingrédients manquants
> - Regroupés en buckets de 5€ pour les achats

---

## 📊 Workflow Typique

1. **👤 Configuration initiale** : Créer un foyer et inviter les profils
2. **📅 Planifier** : Consulter le calendrier et ajouter des menus
3. **🛒 Stocks** : Vérifier la garde-manger et ajouter des produits
4. **🍳 Découvrir** : Explorer les recettes possibles avec les ingrédients disponibles
5. **📝 Courses** : Générer une liste de courses optimisée
6. **🔔 Notifications** : Recevoir les mises à jour et alertes

---

## 🔮 Améliorations Futures

- [ ] Internationalisation (i18n) - Français/Anglais et plus
- [ ] Système de favoris avancé ⭐
- [ ] Partage social des recettes
- [ ] Analyse des dépenses alimentaires
- [ ] Intégration livreurs (Uber Eats, etc.)
- [ ] Suggestions basées sur ML
- [ ] Support paiement intégré

---

## 📝 Remarques Importantes

- Le projet est en développement actif
- Base de données PostgreSQL requise
- Variables d'environnement nécessaires pour Firebase, SendGrid, Cloudinary
- Support complet offline avec IndexedDB

---

## 📞 Objectifs Commerciaux

L'application est prête pour la commercialisation comme :
- **B2C** : Application grand public pour les familles
- **B2B** : Outil pour résidences, maisons de retraite, collectivités
- **Freemium** : Version gratuite limitée + Premium avec IA

---

*Dernier mise à jour : Janvier 2026*  
*Projet en développement | Architecture scalable | Prête pour MVP*
