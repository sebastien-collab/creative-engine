# 📸 Export vers PNG/JPEG

Le Creative Engine peut exporter automatiquement tes créatives HTML en images PNG ou JPEG.

## 🚀 Utilisation rapide

### Exporter une campagne en PNG
```bash
node scripts/export.js formation_mediatracking png
```

### Exporter une campagne en JPEG (plus léger)
```bash
node scripts/export.js ebook_tracking_gratuit jpeg
```

### Exporter toutes les campagnes
```bash
node scripts/export.js all png
```

### Via npm
```bash
npm run export:png -- formation_mediatracking
npm run export:jpeg -- ebook_tracking_gratuit
```

## 📁 Structure après export

```
output/
└── formation_mediatracking/
    ├── images/                          ← Nouveau dossier
    │   ├── formation_mediatracking_v1_urgence_1080x1080.png
    │   ├── formation_mediatracking_v1_urgence_1200x628.png
    │   ├── formation_mediatracking_v1_urgence_1080x1920.png
    │   └── ... (18 fichiers au total)
    ├── formation_mediatracking_v1_urgence_1080x1080.html
    └── manifest.json                    ← Mis à jour avec les chemins images
```

## 🎨 Formats supportés

| Format | Extension | Qualité | Usage recommandé |
|--------|-----------|---------|------------------|
| **PNG** | `.png` | Sans perte | Publications, archives, transparence |
| **JPEG** | `.jpg` | 90% | Ads (Meta, Google), poids réduit |

## 💡 Astuces

- **PNG** = meilleure qualité mais fichiers plus lourds (~500KB-2MB)
- **JPEG** = fichiers plus légers (~100-300KB), idéal pour les campagnes ads
- Le script attend que les **fonts Google** soient chargées avant capture
- Temps d'export : ~2-3 secondes par creative

## 🛠️ Commandes disponibles

```bash
# Lister les campagnes
node scripts/export.js list

# Aide
node scripts/export.js help

# Export avec format explicite
node scripts/export.js formation_mediatracking png
node scripts/export.js formation_mediatracking jpeg
```

## ⚠️ Prérequis

Playwright doit être installé (fait automatiquement avec `npm install`) :
```bash
npm install
npx playwright install chromium
```

## 🔧 Dépendances

- **Playwright** : pour le rendu headless Chrome
- **Chromium** : navigateur embarqué pour la capture d'écran
