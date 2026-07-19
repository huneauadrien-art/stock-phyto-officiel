# Stock Phyto v1.3.1

## Nouveautés

- Préparation inversée : saisir la quantité totale utilisée et la surface ; l'application calcule la dose par hectare.
- Exemple : 100 g sur 6 ha = 16,667 g/ha.
- Le stock est diminué de la quantité totale réellement saisie.
- Suppression d'une ligne d'historique avec confirmation.
- La suppression annule automatiquement l'effet du mouvement sur le stock :
  - une entrée supprimée est retirée du stock ;
  - une sortie ou une préparation supprimée est réintégrée au stock.
- Après suppression, le mouvement correct peut être saisi à nouveau.

## Lancement

```bash
npm install
npm run dev
```
