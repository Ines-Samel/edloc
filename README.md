# EDLoc

> **Votre état des lieux, en toute sérénité.**

EDLoc est une application web qui permet aux **bailleurs particuliers** de réaliser leurs états des lieux d'entrée et de sortie directement sur place, sur un seul appareil, avec le locataire : saisie pièce par pièce, photos horodatées, double signature électronique, PDF envoyé automatiquement aux deux parties, et comparaison entrée / sortie pour objectiver les écarts.

**Statut du projet :** ✅ conception terminée (13 livrables, dossier `docs/`) · 🚧 développement en cours

---

## Le problème

Un état des lieux se fait debout, sur place, souvent dans un moment tendu. Sur papier, il est illisible, incomplet, sans photos datées ; au moment de la sortie, impossible de comparer objectivement avec l'entrée. EDLoc dématérialise l'ensemble du processus, avec une exigence forte d'accessibilité (public peu technophile, daltonisme).

## Fonctionnalités

- **Compte sécurisé** : inscription confirmée par un lien reçu par e-mail (valable 24 h) avant toute connexion, et réinitialisation du mot de passe oublié par lien à usage unique (valable 1 h).
- **Gestion des biens** : fiches logement, recherche libre et filtre par commune.
- **États des lieux d'entrée et de sortie** : l'EDL de sortie est pré-rempli à partir du dernier EDL d'entrée signé du même bien et du même locataire.
- **Saisie pièce par pièce** : chaque élément reçoit un état (Neuf / Bon état / Usage / Mauvais) signalé par trois indices indépendants de la couleur (icône, libellé, style de bordure), pour l'accessibilité aux personnes daltoniennes.
- **Photos horodatées** : rattachées à l'élément, datées automatiquement, valeur de preuve.
- **Double signature sur place** : bailleur puis locataire, sur le même appareil ; l'EDL est ensuite verrouillé (non modifiable).
- **PDF automatique** : généré à la double signature et envoyé par e-mail aux deux parties.
- **Comparaison entrée / sortie** : écarts calculés élément par élément et mis en évidence.
- **Historique par bien** : tous les EDL d'un logement, consultables en lecture seule.
- **Mon compte** : profil modifiable (un changement d'adresse e-mail exige une nouvelle confirmation), changement de mot de passe, export de ses données personnelles et suppression définitive du compte (RGPD).
- **Administration** : rôle dédié (compte seedé) permettant de lister les comptes, les désactiver et les supprimer (RGPD).

## Stack technique

| Couche | Technologie |
| --- | --- |
| Frontend | Next.js (React + TypeScript) · Tailwind CSS · shadcn/ui |
| API | Express (TypeScript) · validation Zod |
| Base de données | PostgreSQL · ORM Prisma |
| Authentification | JWT transporté par un cookie httpOnly · hachage Argon2id · rôles bailleur / administrateur |
| Fichiers | Stockage objet compatible S3 (photos, PDF) |
| Hébergement | Railway (front + API + PostgreSQL) |

Le détail des choix et de leurs alternatives est argumenté dans le cahier des charges (section 7).

## Architecture du dépôt

```
edloc/
├── backend/    → API REST Express + Prisma (routes, contrôleurs, services, middlewares, schémas Zod)
├── frontend/   → application Next.js (App Router : groupes (public), (bailleur), (admin))
└── docs/       → les 13 livrables de conception, classés par phase
```

L'organisation détaillée des dossiers est décrite dans `docs/conception_technique/Arborescence_Projet_EDLoc.pdf`.

## Documentation de conception (`docs/`)

| Dossier | Livrable | Contenu |
| --- | --- | --- |
| `analyse_besoins/` | Cahier des charges | besoin, périmètre, 18 règles de gestion, exigences, architecture, planning |
| | User stories | 22 récits utilisateur avec critères d'acceptation référençant les règles de gestion |
| | Diagramme de cas d'utilisation | 3 acteurs, 14 cas |
| | Diagramme d'activité | cycle de vie complet d'un EDL (couloirs bailleur / système / locataire) |
| `conception_donnees/` | MCD / MLD / MPD | modèle de données Merise |
| | edloc_mpd.sql | script PostgreSQL du modèle physique |
| `conception_fonctionnelle/` | Diagrammes de séquence | connexion, création + photos, signature + PDF, sortie + comparaison |
| `conception_technique/` | Arborescence du site & routes API | sitemap 3 zones, 38 routes documentées (accès, user stories) |
| | Arborescence du projet | organisation des dossiers backend / frontend |
| | Conventions de nommage | BDD, API, code TypeScript, Git |
| `conception_UI/` | Charte graphique | identité « Chaleureuse & accessible » : palette, typographie, logo, accessibilité |
| | Wireframes | 16 écrans basse fidélité : 15 déclinés en 3 formats, administration au format desktop |
| | Maquettes | 16 écrans haute fidélité appliquant la charte |

## Conventions

Le vocabulaire métier est en **français** de bout en bout : `etat_des_lieux` (table), `/api/etats-des-lieux` (ressource), `EtatDesLieux` (type), `etatDesLieux` (variable). Les commits suivent **Conventional Commits** (`feat:`, `fix:`, `docs:`, …) et les branches `feature/…` / `fix/…`. Détail complet : `docs/conception_technique/Conventions_Nommage_EDLoc.pdf`.

## Démarrage

### Backend (API)

Prérequis : Node.js ≥ 20 et PostgreSQL 16 (avec une base `edloc` créée).

```bash
cd backend
npm install              # dépendances + génération du client Prisma
cp .env.example .env     # puis renseigner les valeurs (base, JWT_SECRET, compte admin)
npx prisma migrate dev   # crée les tables
npx prisma db seed       # crée le compte administrateur
npm run dev              # démarre l'API sur http://localhost:4000
```

Route de santé : `GET /api/health`. Des fichiers de tests HTTP (extension VS Code REST Client) sont fournis dans `backend/tests/` ; la connexion y pose un cookie de session que l'extension rejoue automatiquement.

**Session et cookie.** Le jeton JWT n'est jamais exposé au JavaScript : il est transporté par un cookie `httpOnly`, ce qui neutralise le vol de session par XSS. Deux variables pilotent son comportement selon la forme du déploiement :

| `COOKIE_SAMESITE` | Quand l'utiliser |
| --- | --- |
| `lax` (défaut) | Front et API sur le même domaine enregistrable — `app.exemple.fr` / `api.exemple.fr`, ou `localhost` en développement. |
| `none` | Front et API sur deux sites distincts, par exemple deux sous-domaines `*.up.railway.app`. Le navigateur impose alors `Secure`, activé automatiquement. |

`CORS_ORIGINE` liste les origines autorisées : une autorisation générique `*` est refusée par le navigateur dès qu'une requête porte des cookies. Un contrôle d'origine sur toutes les requêtes qui modifient des données protège de la CSRF, y compris en `SameSite=none`.

### Frontend (application web)

Prérequis : Node.js ≥ 20, l'API démarrée.

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL pointe vers l'API
npm run dev                  # démarre l'application sur http://localhost:3000
```

Les tokens de la charte graphique (couleurs, échelle typographique, pilules, cible tactile de 48 px) sont déclarés en CSS dans `app/globals.css` : Tailwind v4 n'utilise plus de fichier `tailwind.config.ts`.

## Feuille de route du développement

- [x] Schéma Prisma (traduction du MPD) + seed du compte administrateur
- [x] Initialisation du backend (Express, routeur central, middlewares, gestion globale des erreurs)
- [x] Authentification (inscription, connexion, détection de session) avec JWT et Argon2id
- [x] Confirmation de l'adresse e-mail et mot de passe oublié (jetons à usage unique hachés en base)
- [x] Session par cookie httpOnly (CORS restreint, contrôle d'origine anti-CSRF)
- [x] Espace « Mon compte » : profil, mot de passe, export et suppression RGPD
- [x] Initialisation du frontend (Next.js 16, tokens de la charte, client API)
- [x] Écrans publics : accueil, authentification, pages légales, 404 et page d'erreur
- [ ] Gestion des biens
- [x] États des lieux : création, saisie pièce par pièce, photos horodatées (stockage objet R2)
- [x] Double signature, verrouillage, génération et envoi du PDF (pdfkit, e-mails Brevo)
- [ ] Comparaison entrée / sortie
- [ ] Écran d'administration
- [ ] Tests, accessibilité, déploiement Railway

## Évolutions envisagées

Mode hors-ligne avec synchronisation · monétisation (abonnement mensuel ou facturation à l'EDL, intégration Stripe, conditionnée à la création d'une structure juridique).

---

Projet personnel de portfolio réalisé par **Inès Samel**, Conceptrice Développeuse d'Applications · © 2026
