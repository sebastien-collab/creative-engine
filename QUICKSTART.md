# 🚀 Quick Start - Creative Engine

## Installation

```bash
cd creative-engine
npm install
```

## 3 commandes pour tout faire

### 1. Générer une config A/B test
```bash
npm run ab:generate -- ma_campagne assets/mon_produit.png
```

Ça crée automatiquement 12 variations basées sur des hooks copywriting éprouvés :
- **Urgence** : "Derniers jours...", "Ça se termine ce soir..."
- **Rareté** : "Seulement 7 places...", "Stock limité..."
- **Preuve sociale** : "Rejoins les +10,000..."
- **Résultat** : "Tes premiers clients en 7 jours..."

### 2. Générer les créatives HTML
```bash
npm run generate -- ma_campagne_ab_test.json
```

Génère automatiquement :
- 12 variations
- 3 formats (1080x1080, 1200x628, 1080x1920)
- **= 36 créatives en 2 secondes**

### 3. Exporter en PNG (optionnel)
```bash
npm run export -- ma_campagne
```

## 📁 Structure générée

```
output/
└── ma_campagne/
    ├── ma_campagne_v1_urgency_1080x1080.html
    ├── ma_campagne_v1_urgency_1200x628.html
    ├── ma_campagne_v1_urgency_1080x1920.html
    ├── ma_campagne_v2_urgency_1080x1080.html
    ├── ... (36 fichiers)
    └── manifest.json ← Tracking des variations
```

## 🎨 Personnalisation

### Modifier les templates
Édite `templates/single-product.html` :
- Change les fonts (Google Fonts supporté)
- Ajuste les couleurs, ombres, animations
- Ajoute des éléments visuels

### Modifier les hooks copy
Édite `scripts/ab_test_generator.js` :
- Ajoute tes propres headlines
- Change les CTAs
- Ajoute de nouveaux angles de vente

### Modifier la config manuellement
Crée ton propre JSON dans `configs/` :

```json
{
  "campaign": "mon_projet",
  "template": "single-product",
  "formats": ["1080x1080", "1200x628"],
  "base_config": {
    "font_family": "Inter",
    "headline_size": 64,
    "bg_color1": "#ff6b6b",
    "bg_color2": "#4ecdc4"
  },
  "variations": [
    {
      "id": "v1",
      "headline": "Mon super titre",
      "cta_text": "Acheter maintenant",
      "badge_text": "-30%"
    }
  ]
}
```

## 💡 Pro Tips

1. **Preview rapide** : Ouvre les fichiers HTML directement dans Chrome
2. **Fonts** : Le template charge automatiquement Google Fonts
3. **Images** : Mets tes produits dans `assets/` et référence-les comme `assets/mon_produit.png`
4. **Batch** : Tu peux générer des centaines de variations en une commande

## 🔄 Workflow idéal

1. Tu écris/configures les headlines/CTAs
2. Tu génères la config A/B
3. Tu génères les créatives
4. Tu exportes en PNG (ou tu upload les HTML direct si la plateforme accepte)
5. Tu lances les campagnes avec UTM tracking par variation
6. Tu analyses les résultats via le manifest.json

---

**Résultat en 2 min chrono** : 36 créatives prêtes à tester, structurées, traçables.
