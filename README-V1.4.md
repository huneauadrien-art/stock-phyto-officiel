# Stock Phyto v1.4 — synchronisation multi-appareils

## Configuration locale
Créer `.env.local` à la racine :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

L'ancien nom `VITE_SUPABASE_ANON_KEY` reste accepté.

## Premier démarrage
- Connectez-vous avec le même compte sur tous les appareils.
- Si Supabase est vide et que le navigateur contient déjà des données locales, elles sont envoyées automatiquement.
- Si Supabase contient déjà des données, elles deviennent la référence et sont téléchargées sur l'appareil.

## Connexion interrompue
Les changements restent enregistrés dans le navigateur. Le bandeau affiche « Hors connexion — sauvegarde en attente ». Au retour du réseau, l'état complet est envoyé automatiquement à Supabase.

## Vercel
Ajouter dans Settings > Environment Variables :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Puis redéployer le projet.
