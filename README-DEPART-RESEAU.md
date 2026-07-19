# Stock Phyto v1.3.2 Réseau

Cette version reprend l'interface validée de la v1.3.1 et ajoute uniquement la synchronisation Supabase.

## Configuration locale

1. Copier `.env.example` et renommer la copie `.env`.
2. Renseigner :

```env
VITE_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=VOTRE_CLE_PUBLIQUE
```

3. Dans le dossier du projet :

```bash
npm install
npm run dev
```

Sans fichier `.env`, l'application reste en **Mode local**.
Avec les deux valeurs Supabase, elle affiche l'écran de connexion puis **Synchronisé**.

Ne jamais utiliser la clé `service_role` dans ce fichier.
