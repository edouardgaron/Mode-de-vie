# Mode de Vie - Système Personnel

Un système complet de gestion de vie construite avec **Next.js 15** et **TypeScript**, conçu spécifiquement pour Édouard.

## Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Étapes

1. **Cloner ou naviguer vers le répertoire**
```bash
cd "C:\Users\Edouard\Desktop\Projets\Mode de vie"
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer le serveur de développement**
```bash
npm run dev
```

4. **Ouvrir dans le navigateur**
Accédez à `http://localhost:3000`

## Fonctionnalités

### Dashboard
- Affichage du score quotidien avec animation
- Score hebdomadaire moyen
- Compteur de streak (jours consécutifs)
- Graphiques des 7 derniers jours
- Export/import des données JSON
- Réinitialisation des données

### Check-in Quotidien
- 8 habitudes booléennes (santé + business)
- 3 échelles (énergie, stress, confiance, intégrité)
- Journal avec 3 questions de réflexion
- Calcul automatique du score
- Feedback motivationnel

### Objectifs 90 jours
- Créer, modifier, supprimer des objectifs
- 5 catégories (santé, business, finances, personnel, social)
- Suivi de progression avec sliders
- Activation/désactivation d'objectifs

### Business Focus
- Entreprise principale du mois
- Objectif mensuel
- 3 priorités hebdomadaires
- 3 tâches quotidiennes
- Parking lot (idées à NE PAS démarrer)
- Gestion des projets actifs (max 3)

### Santé
- Poids, sommeil, entraînement, marche
- Niveau de vape avec suivi de réduction
- Énergies et stress quotidiens
- Graphiques: vape (7j), activités (7j), énergie (7j)
- Historique complet

### Finances
- Revenu par source (peinture, préfab, immobilier, autre)
- Dépenses personnelles et business
- Épargne et investissements
- Objectif de liberté financière (500k$)
- Historique mensuel

### Journal d'Honnêteté
- Planifié vs Réalisé
- Exagérations/Fuites à reconnaître
- Correction pour le jour suivant
- Score d'intégrité
- Historique déroulable

### Revue Hebdomadaire
- Ce qui a fonctionné
- Ce qui a été évité
- Habitudes réussies vs manquées
- Raisons des échecs
- À garder / À changer
- Priorité et objectifs de la prochaine semaine
- Score global (1-10)

## Structure du Projet

```
Mode de vie/
├── app/
│   ├── layout.tsx          # Layout racine
│   ├── globals.css         # Styles globaux
│   ├── page.tsx            # Dashboard
│   ├── checkin/
│   ├── goals/
│   ├── business/
│   ├── health/
│   ├── finances/
│   ├── journal/
│   └── review/
├── components/
│   ├── Navigation.tsx      # Menu de navigation
│   ├── DataInitializer.tsx # Initialisation des données par défaut
│   ├── ScoreRing.tsx       # Composant d'anneau de score
│   ├── HabitCheck.tsx      # Case à cocher habitude
│   ├── SliderInput.tsx     # Slider personnalisé
│   ├── StatCard.tsx        # Carte statistique
│   └── ui/                 # Composants shadcn/ui
├── lib/
│   ├── storage.ts          # Gestion localStorage
│   ├── scoring.ts          # Logique de calcul de score
│   ├── seed.ts             # Données par défaut
│   └── utils.ts            # Utilitaires
├── types/
│   └── index.ts            # Tous les types TypeScript
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── postcss.config.mjs
```

## Stockage des Données

Toutes les données sont stockées **localement** dans `localStorage` du navigateur:
- Aucune base de données serveur
- Aucune transmission au cloud
- Données 100% privées et locales
- Export/import via fichiers JSON pour sauvegarde

## Thème

- **Mode**: Dark (professionnel)
- **Couleurs principales**: Noir, blanc, gris, vert foncé
- **Palette**: Minimaliste et épurée
- **Responsive**: Mobile-first, optimisé pour desktop

## Scripts

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer la version production
npm start

# Linter
npm run lint
```

## Architecture

### Types de données
- **DailyCheckin**: Check-in quotidien
- **Goal**: Objectif 90j
- **BusinessFocus**: Focus mensuel
- **HealthEntry**: Entrée santé
- **FinanceEntry**: Entrée financière
- **JournalEntry**: Entrée journal
- **WeeklyReview**: Revue hebdomadaire
- **FinancialGoal**: Objectif financier global

### Scoring
Le score quotidien (0-100) est basé sur:
- **Santé** (30pts): sommeil, marche, entraînement, eau, vape, actions
- **Business** (25pts): 3 tâches, éviter dispersion, énergie
- **Intégrité** (20pts): honnêteté, score d'intégrité
- **Finance** (10pts): actions financières
- **Journal** (10pts): qualité des réponses
- **Social** (5pts): contact social

## Objectifs personnels

### Santé
- Marcher 45 min minimum 5x/semaine
- Entraînement 3x/semaine
- Réduire et arrêter la vape
- Dormir 7+ heures

### Business
- 3 tâches importantes par jour
- Éviter la dispersion entre les 3 entreprises
- Une priorité principale par mois
- Finir avant de lancer

### Finances
- Suivre tous les revenus (3 sources)
- Limiter les dépenses
- Épargner chaque mois
- Atteindre 500k$ nets d'ici 2030

### Personnel
- Honnêteté brutale avec soi-même
- Journal quotidien (10 min)
- Ne pas surpromettre
- Revue hebdomadaire systématique

## Technologies

- **Next.js 15**: Framework React
- **TypeScript**: Typage strict
- **Tailwind CSS**: Styles utilitaires
- **Recharts**: Graphiques
- **Lucide React**: Icônes
- **localStorage**: Stockage local

## Notes

- Aucune erreur TypeScript
- Données persistantes entre sessions
- Interface minimaliste et épurée
- Messages motivationnels
- Entièrement en français

## Support

Pour toute question ou amélioration, modifiez les fichiers directement ou contactez Claude Code.

---

**Version**: 1.0.0  
**Dernière mise à jour**: Mai 2026
