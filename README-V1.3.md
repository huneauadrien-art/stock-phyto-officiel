# Stock Phyto v1.3

## Nouveautés
- Entrée et sortie directement depuis chaque carte produit.
- Saisie mobile en deux étapes avec clavier numérique.
- Nouveau tableau de bord visuel.
- Préparation multi-produits avec contrôle du stock et retrait automatique.
- Historique créé automatiquement après validation.
- Synchronisation optionnelle Supabase entre PC, iPhone et tablette.

## Mode local
Sans fichier `.env`, l'application continue de fonctionner localement comme la v1.2.

## Activer Supabase
1. Créer un projet Supabase.
2. Exécuter `supabase-schema.sql` dans SQL Editor.
3. Copier `.env.example` vers `.env`.
4. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
5. Relancer `npm run dev`.

Connecter en premier l'ordinateur qui contient le bon stock : si le compte cloud est vide, les données locales seront importées automatiquement.
