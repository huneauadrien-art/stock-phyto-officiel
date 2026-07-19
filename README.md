# Stock Phyto v1.0

## Démarrage
1. Décompresser le dossier.
2. Ouvrir un terminal dans le dossier qui contient `package.json`.
3. Exécuter `npm install` puis `npm run dev`.

## Installation iPhone / tablette
Déployer le projet sur Vercel, ouvrir l'adresse dans Safari, puis Partager > Sur l'écran d'accueil.

## Synchronisation Supabase
1. Créer un projet Supabase.
2. Exécuter `supabase-schema.sql` dans SQL Editor.
3. Copier `.env.example` vers `.env` et renseigner les clés.
4. La structure est prête ; la synchronisation distante sera activée dans la prochaine itération.

## Important
Sans Supabase, les données sont stockées localement dans le navigateur de chaque appareil.
