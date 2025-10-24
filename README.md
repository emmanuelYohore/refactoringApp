# Application de gestion de services et réservations

## Présentation du projet

Cette application web a été développée pour permettre la gestion et la réservation de services (salles et équipements) dans un contexte professionnel ou éducatif. Elle permet aux utilisateurs de visualiser les services disponibles, consulter leurs créneaux horaires, effectuer des réservations, et gérer leurs réservations existantes. Un panneau d'administration est également disponible pour gérer l'offre de services et leurs créneaux.

### Domaine d'application

L'application s'inscrit dans le domaine de la gestion de ressources partagées, permettant d'optimiser l'utilisation de salles de réunion, d'équipements techniques ou autres ressources limitées au sein d'une organisation. Elle répond aux besoins courants de planification et de coordination des ressources.

## Choix techniques justifiés

### Frontend
- **Vue.js 3** : Choisi pour sa légèreté, sa réactivité et son système de composants qui facilite le développement d'interfaces modulaires.
- **Pinia** : Utilisé comme gestionnaire d'état global, plus moderne et type-safe que Vuex, permettant une meilleure organisation du code et une gestion d'état plus claire.
- **Vue Router** : Pour la navigation entre les différentes vues de l'application.
- **Bootstrap** : Framework CSS pour une mise en page responsive et un design cohérent sans avoir à écrire beaucoup de CSS personnalisé.

### Gestion des données
- **LocalStorage** : Utilisé pour persister les données côté client, simplifiant l'architecture en évitant le besoin d'un backend pour cette démonstration.
- **Format JSON** : Pour la structuration des données, facilitant l'échange entre le stockage et l'application.

Ces choix techniques permettent un développement rapide, une maintenance facile et une expérience utilisateur fluide tout en maintenant une architecture simple adaptée à la taille du projet.

- **Format JSON** : Utilisation de Prettier pour le formattage

## Installation et exécution

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/emmanuelYohore/refactoringApp.git
   cd refactoringApp
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer l'application en développement**
   ```bash
   npm run dev
   ```


## Utilisation

- **Connexion** : Utilisez n'importe quelle adresse email (pas de mot de passe requis pour cette démo)
- **Accès administrateur** : Connectez-vous avec `admin@example.com` pour accéder au panneau d'administration
- **Réservation** : Sélectionnez un service, choisissez un créneau disponible et confirmez votre réservation
- **Gestion des réservations** : Consultez et annulez vos réservations depuis la page d'accueil
- **Administration** : Ajoutez des services, créez des créneaux et gérez l'offre disponible

## Architecture et structure du projet

L'application suit une architecture frontend moderne basée sur des composants Vue.js et un état global géré par Pinia.

### Structure des dossiers

```
refactoringApp/
├── public/
│   └── data/
│       └── data.json        # Données initiales de l'application
├── src/
│   ├── assets/              # Ressources statiques (images, styles)
│   ├── components/          # Composants Vue réutilisables
│   ├── router/
│   │   └── index.js         # Configuration des routes
│   ├── store/
│   │   ├── service.js       # Store Pinia pour les services et réservations
│   │   └── user.js          # Store Pinia pour la gestion des utilisateurs
│   ├── views/
│   │   ├── AdminPanel.vue   # Vue panneau d'administration
│   │   ├── Home.vue         # Vue principale avec liste des services
│   │   ├── Login.vue        # Vue connexion
│   │   └── MyReservations.vue # Vue des réservations utilisateur
│   ├── App.vue              # Composant racine
│   └── main.js              # Point d'entrée de l'application
├── .gitignore               # Fichiers ignorés par Git
├── package.json             # Dépendances et scripts
└── README.md                # Documentation
```

### Flux de données

1. Les données initiales sont chargées depuis `/public/data/data.json` au premier lancement
2. Les stores Pinia centralisent l'état de l'application et les méthodes de manipulation
3. Les modifications sont persistées dans le localStorage du navigateur
4. Les composants Vue consomment et modifient les données via les stores

### Structure des données

```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@example.com",
      "role": "admin"
    }
  ],
  "services": [
    {
      "id": "svc_1",
      "name": "Salle A",
      "type": "room",
      "description": "Salle de réunion",
      "duration": 60
    }
  ],
  "slots": [
    {
      "id": "slt_1",
      "serviceId": "svc_1",
      "datetime": "2025-10-20T09:00:00Z",
      "capacity": 1
    }
  ],
  "reservations": [
    {
      "id": "res_1",
      "slotId": "slt_1",
      "serviceId": "svc_1",
      "userEmail": "user@example.com",
      "createdAt": "2025-10-20T08:30:00Z"
    }
  ]
}
```

## Règles métier

- Pas de double réservation sur un même créneau pour un même utilisateur
- Respect de la capacité maximale des créneaux
- Annulation possible uniquement pour des réservations futures
- Filtrage automatique des créneaux passés
- Mode administrateur pour gérer l'ensemble des services et créneaux