# Stock Phyto — version officielle 2.0

Version unique et propre de l'application Stock Phyto.

## Installation locale

```bash
npm install
npm run dev
```

## Variables Supabase

Créer un fichier `.env.local` à partir de `.env.example` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

Le fichier `.env.local` ne doit jamais être envoyé sur GitHub.

## Déploiement Vercel

- Framework : Vite
- Root Directory : `./`
- Build Command : `npm run build`
- Output Directory : `dist`
- Ajouter les deux variables Supabase dans Vercel

## Structure

Le projet doit être importé directement depuis ce dossier. Il ne contient ni `node_modules`, ni `dist`, ni fichier `.env.local`.
