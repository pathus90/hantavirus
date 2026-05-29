# NAVIS — Portail de collecte (Hantavirus)

Portail web pour l’étude **Natural History of Andes Virus Infection (NAVIS)** : soumission des données épidémiologiques par les points focaux nationaux, et tableau de bord administrateur pour consulter, filtrer, visualiser et exporter les résultats.

**Dépôt :** [github.com/pathus90/hantavirus](https://github.com/pathus90/hantavirus)

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Données | Supabase (PostgreSQL + Auth + API) |
| Graphiques admin | Recharts |
| Export admin | CSV, Excel (xlsx) |

## Fonctionnalités

### Portail public (`/`)

- Formulaire de collecte (pays, date, données épidémiologiques, expositions, réglementaire)
- Sélecteur de pays (combobox), sélecteur de date personnalisé
- **Upsert** : une soumission pour le **même pays** et la **même date de rapport** met à jour le rapport du jour ; sinon création d’un nouveau rapport
- Lien vers l’espace admin

### Espace admin (`/admin`)

- Connexion Supabase Auth (email / mot de passe)
- Filtres : pays, éthique, plage de dates
- Indicateurs, graphiques (cas par pays, soumissions dans le temps, éthique, inscrits)
- Tableau détaillé avec détail des expositions
- Export CSV / Excel (rapports et jeux agrégés)
- Déconnexion → retour à l’accueil

## Prérequis

- Node.js 20+
- Un projet [Supabase](https://supabase.com)

## Installation locale

```bash
git clone https://github.com/pathus90/hantavirus.git
cd hantavirus
npm install
cp .env.example .env
```

Renseigner `.env` (voir ci-dessous), puis :

```bash
npm run dev
```

Application : [http://localhost:5173](http://localhost:5173)

## Configuration Supabase

### 1. Variables d’environnement

Copier [`.env.example`](./.env.example) vers `.env` (fichier **local**, non versionné) :

```env
VITE_SUPABASE_URL=https://VOTRE_PROJET.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

Récupérer ces valeurs dans **Project Settings → API** (URL + clé **anon public** uniquement).

### 2. Base de données

Dans **SQL Editor**, exécuter dans l’ordre :

1. [`supabase/setup-complete.sql`](./supabase/setup-complete.sql) — table, RLS, lecture admin, fonction d’upsert  
2. Si la base existait déjà sans upsert : [`supabase/migration-upsert-report.sql`](./supabase/migration-upsert-report.sql) (une fois)

Autres migrations optionnelles selon l’historique du projet : voir le dossier [`supabase/`](./supabase/).

### 3. Comptes administrateur

Créer les utilisateurs dans **Authentication → Users** (bouton *Add user*, cocher *Auto Confirm User*).

Les identifiants admin **ne doivent pas** être stockés dans ce dépôt Git.

## Sécurité et secrets

| À versionner | À ne **jamais** committer |
|--------------|---------------------------|
| `.env.example` (placeholders) | `.env`, `.env.local`, `.env.production` |
| Code source | Clé `service_role` Supabase |
| Scripts SQL | Mots de passe admin, tokens privés |

- Seule la clé **anon** (publique) est utilisée côté navigateur.
- La politique RLS limite le public à **INSERT** ; la **lecture** des rapports est réservée aux utilisateurs **authenticated** (admin).
- L’upsert passe par la fonction SQL `submit_hantavirus_report` (`SECURITY DEFINER`), sans ouvrir `UPDATE` au rôle `anon`.

Avant chaque push, vérifier qu’aucun secret n’est dans le diff :

```bash
git status
git diff
```

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run lint` | ESLint |

## Structure du projet

```
src/
  components/
    HantavirusPortal.tsx   # Formulaire public
    CountryCombobox.tsx
    DatePicker.tsx
    admin/
      AdminPortal.tsx      # Auth + routage admin
      AdminDashboard.tsx   # Tableau de bord
      AdminLogin.tsx
      adminUtils.ts
      adminExport.ts
  lib/supabase.ts
  types/report.ts
supabase/                  # Scripts SQL
```

## Routes

| Chemin | Accès |
|--------|--------|
| `/` | Public — collecte |
| `/admin` | Connexion requise — tableau de bord |

## Déploiement

1. Build : `npm run build` (sortie dans `dist/`)
2. Héberger les fichiers statiques (Vercel, Netlify, etc.)
3. Définir `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les variables d’environnement de la plateforme
4. S’assurer que les scripts SQL ont été exécutés sur le projet Supabase de production

## Licence

Projet privé — usage interne NAVIS / collaborateurs autorisés.
