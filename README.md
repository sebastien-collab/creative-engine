# Creative Engine - Production de Créatives à Grande Échelle

## 🎯 Concept

Système de génération de créatives publicitaires basé sur **HTML/CSS + JSON**, avec export PNG/JPEG final. 

**Pourquoi pas l'IA image directe ?**
- GPT/Claude génèrent mal les visuels (trop aléatoire, pas de contrôle précis)
- Coût élevé pour du volume
- Pas éditable après coup

**Pourquoi HTML/CSS + JSON ?**
- Contrôle total sur le design
- Templates réutilisables et modulaires
- Génération par lots ultra-rapide
- Export PNG propre via headless browser
- Facilement versionnable (git)

---

## 📁 Architecture

```
creative-engine/
├── templates/          # Templates HTML réutilisables
│   ├── base.html       # Structure de base
│   ├── styles/         # CSS modules
│   └── variants/       # Variantes de layout
├── components/         # Composants réutilisables
│   ├── headlines/      # Titres pré-écrits
│   ├── ctas/           # Boutons call-to-action
│   └── badges/         # Badges promo, urgent, etc.
├── configs/            # Fichiers JSON de configuration
│   ├── products/       # Data produits
│   └── campaigns/      # Configs de campagnes
├── scripts/
│   ├── generate.js     # Générateur principal
│   └── export.js       # Export PNG/PDF
└── output/             # Créatives générées
```

---

## 🚀 Workflow

1. **Définir un template** (HTML avec placeholders)
2. **Créer un fichier de config** (JSON avec les variations)
3. **Générer les créatives** (batch processing)
4. **Exporter** (PNG/JPEG aux formats demandés)

---

## 📸 Export vers PNG/JPEG

Convertis tes créatives HTML en images prêtes pour les plateformes ads :

```bash
# Exporter une campagne en PNG
node scripts/export.js formation_mediatracking png

# Exporter en JPEG (plus léger pour les ads)
node scripts/export.js ebook_tracking_gratuit jpeg

# Exporter toutes les campagnes
node scripts/export.js all png
```

Voir [EXPORT_GUIDE.md](EXPORT_GUIDE.md) pour le guide complet.

---

## 💡 Exemple Concret

### Template HTML (`templates/single-product.html`)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .creative {
      width: 1080px;
      height: 1080px;
      background: linear-gradient(135deg, {{bg_color1}} 0%, {{bg_color2}} 100%);
      font-family: {{font_family}}, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .badge {
      position: absolute;
      top: 40px;
      right: 40px;
      background: {{badge_color}};
      color: white;
      padding: 12px 24px;
      border-radius: 30px;
      font-weight: bold;
      font-size: 24px;
      transform: rotate(5deg);
    }
    .product-img {
      width: 500px;
      height: 500px;
      object-fit: contain;
      margin-bottom: 30px;
      filter: drop-shadow(0 20px 40px rgba(0,0,0,0.2));
    }
    .headline {
      font-size: 56px;
      font-weight: 900;
      color: {{text_color}};
      text-align: center;
      line-height: 1.2;
      max-width: 900px;
      margin-bottom: 20px;
    }
    .subheadline {
      font-size: 32px;
      color: {{text_color}};
      opacity: 0.9;
      text-align: center;
      margin-bottom: 40px;
    }
    .cta {
      background: {{cta_color}};
      color: white;
      padding: 24px 60px;
      border-radius: 50px;
      font-size: 28px;
      font-weight: bold;
      text-decoration: none;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div class="creative">
    <div class="badge">{{badge_text}}</div>
    <img class="product-img" src="{{product_image}}" alt="">
    <div class="headline">{{headline}}</div>
    <div class="subheadline">{{subheadline}}</div>
    <div class="cta">{{cta_text}}</div>
  </div>
</body>
</html>
```

### Fichier de Config (`configs/campaign-soldes.json`)

```json
{
  "campaign": "soldes_ete_2026",
  "template": "single-product",
  "formats": ["1080x1080", "1200x628", "1080x1920"],
  "base_config": {
    "bg_color1": "#FF6B6B",
    "bg_color2": "#4ECDC4",
    "text_color": "#FFFFFF",
    "cta_color": "#FFE66D",
    "font_family": "Poppins"
  },
  "variations": [
    {
      "id": "v1_urgent",
      "badge_text": "-50%",
      "headline": "DERNIERS JOURS",
      "subheadline": "Profitez des soldes avant qu'il ne soit trop tard",
      "cta_text": "J'en profite →",
      "badge_color": "#FF4757"
    },
    {
      "id": "v2_social_proof",
      "badge_text": "TOP VENTE",
      "headline": "+10,000 CLIENTS SATISFAITS",
      "subheadline": "Rejoignez ceux qui ont déjà sauté le pas",
      "cta_text": "Rejoindre les insiders",
      "badge_color": "#2ED573"
    },
    {
      "id": "v3_scarcity",
      "badge_text": "STOCK LIMITÉ",
      "headline": "IL EN RESTE PLUS QUE 7",
      "subheadline": "Ne manquez pas cette opportunité unique",
      "cta_text": "Commander maintenant",
      "badge_color": "#FFA502"
    },
    {
      "id": "v4_benefit",
      "badge_text": "OFFRE SPÉCIALE",
      "headline": "RÉSULTATS EN 7 JOURS",
      "subheadline": "La méthode validée par +500 entrepreneurs",
      "cta_text": "Découvrir la méthode",
      "badge_color": "#3742FA"
    }
  ]
}
```

---

## 🔧 Scripts de Génération

### 1. Générateur de créatives (`scripts/generate.js`)

```javascript
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');

class CreativeEngine {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.configsDir = path.join(__dirname, '../configs');
    this.outputDir = path.join(__dirname, '../output');
  }

  async init() {
    this.browser = await puppeteer.launch();
  }

  async generateFromConfig(configPath) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const templatePath = path.join(this.templatesDir, `${config.template}.html`);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);
    
    const results = [];

    for (const format of config.formats) {
      const [width, height] = format.split('x').map(Number);
      
      for (const variation of config.variations) {
        const data = {
          ...config.base_config,
          ...variation,
          width,
          height
        };

        const html = template(data);
        const filename = `${config.campaign}_${variation.id}_${format}.png`;
        const outputPath = path.join(this.outputDir, config.campaign, filename);

        await this.renderToImage(html, outputPath, width, height);
        
        results.push({
          campaign: config.campaign,
          variation: variation.id,
          format,
          path: outputPath,
          elements: {
            headline: variation.headline,
            cta: variation.cta_text,
            badge: variation.badge_text
          }
        });
      }
    }

    // Sauvegarde le manifest pour tracking
    const manifestPath = path.join(this.outputDir, config.campaign, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2));

    return results;
  }

  async renderToImage(html, outputPath, width, height) {
    const page = await this.browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    await page.screenshot({
      path: outputPath,
      type: 'png',
      omitBackground: false
    });

    await page.close();
  }

  async close() {
    await this.browser.close();
  }
}

// CLI
async function main() {
  const configFile = process.argv[2];
  if (!configFile) {
    console.log('Usage: node generate.js <config-file.json>');
    process.exit(1);
  }

  const engine = new CreativeEngine();
  await engine.init();
  
  const configPath = path.join(__dirname, '../configs', configFile);
  const results = await engine.generateFromConfig(configPath);
  
  console.log(`✅ ${results.length} créatives générées:`);
  results.forEach(r => console.log(`  - ${r.path}`));
  
  await engine.close();
}

main().catch(console.error);
```

### 2. Script de test A/B automatique (`scripts/ab_test_generator.js`)

```javascript
/**
 * Générateur de matrices de test A/B
 * Teste toutes les combinaisons d'éléments
 */

const fs = require('fs');

class ABTestGenerator {
  constructor() {
    this.headlines = [
      "Derniers jours pour en profiter",
      "Offre exclusive membre",
      "Stock limité - Act vite",
      "Résultats garantis en 30 jours",
      "La méthode des pros",
      "Ne payez que si ça marche"
    ];
    
    this.ctas = [
      { text: "J'en profite", color: "#FF6B6B" },
      { text: "Découvrir", color: "#4ECDC4" },
      { text: "Commander", color: "#FFE66D" },
      { text: "Réserver ma place", color: "#95E1D3" }
    ];
    
    this.badges = [
      { text: "-50%", color: "#FF4757" },
      { text: "Nouveau", color: "#2ED573" },
      { text: "Top Ventes", color: "#FFA502" },
      { text: "Édition Limitée", color: "#3742FA" }
    ];
    
    this.backgrounds = [
      { color1: "#667eea", color2: "#764ba2" },
      { color1: "#f093fb", color2: "#f5576c" },
      { color1: "#4facfe", color2: "#00f2fe" },
      { color1: "#43e97b", color2: "#38f9d7" }
    ];
  }

  generateMatrix(campaignName, productImage, maxVariations = 16) {
    const variations = [];
    let counter = 1;

    // Génère des combinaisons pertinentes (pas toutes, trop de bruit)
    for (let h = 0; h < this.headlines.length && counter <= maxVariations; h++) {
      for (let c = 0; c < this.ctas.length && counter <= maxVariations; c++) {
        for (let b = 0; b < this.badges.length && counter <= maxVariations; b++) {
          const bg = this.backgrounds[counter % this.backgrounds.length];
          
          variations.push({
            id: `v${counter}`,
            headline: this.headlines[h],
            subheadline: "Livraison gratuite dès 50€ d'achat",
            cta_text: this.ctas[c].text,
            cta_color: this.ctas[c].color,
            badge_text: this.badges[b].text,
            badge_color: this.badges[b].color,
            bg_color1: bg.color1,
            bg_color2: bg.color2,
            product_image: product_image
          });
          
          counter++;
        }
      }
    }

    return {
      campaign: campaignName,
      template: "single-product",
      formats: ["1080x1080", "1200x628", "1080x1920"],
      base_config: {
        text_color: "#FFFFFF",
        font_family: "Poppins"
      },
      variations: variations
    };
  }

  saveConfig(campaignName, productImage, outputDir = './configs') {
    const config = this.generateMatrix(campaignName, productImage);
    const filename = `${campaignName}_ab_test.json`;
    const filepath = `${outputDir}/${filename}`;
    
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(filepath, JSON.stringify(config, null, 2));
    
    console.log(`✅ Config A/B générée: ${filepath}`);
    console.log(`📊 ${config.variations.length} variations prêtes à tester`);
    
    return filepath;
  }
}

// Usage
const generator = new ABTestGenerator();
generator.saveConfig('soldes_fevrier', 'assets/product.png');
```

---

## 📦 Installation & Usage

```bash
# 1. Setup
mkdir creative-engine && cd creative-engine
npm init -y
npm install puppeteer handlebars

# 2. Créer la structure
mkdir -p templates components configs scripts output assets

# 3. Générer les créatives
node scripts/generate.js campaign-soldes.json

# 4. Générer un test A/B complet
node scripts/ab_test_generator.js
```

---

## 🎨 Templates Bonus

### Template Carousel (`templates/carousel-card.html`)
Pour les carrousels Instagram/LinkedIn :

```html
<div class="carousel-card" style="width:1080px; height:1080px; background:{{bg_color}};">
  <div class="card-number">{{card_number}}/{{total_cards}}</div>
  <h2>{{title}}</h2>
  <p>{{content}}</p>
  <div class="swipe-indicator">→ Glisser</div>
</div>
```

### Template Story (`templates/story.html`)
Format 9:16 avec animations CSS :

```html
<div class="story" style="width:1080px; height:1920px; background:{{bg_color}};">
  <div class="progress-bar"></div>
  <div class="content animated fadeInUp">
    <h1>{{headline}}</h1>
    <div class="poll">
      {{#each poll_options}}
      <div class="poll-option">{{this}}</div>
      {{/each}}
    </div>
  </div>
</div>
```

---

## 🔄 Intégration avec Claude/OpenClaw

Tu peux demander à l'IA de :

1. **Générer les variations de copy** (headlines, CTAs, subheadlines)
2. **Suggérer des combinaisons** basées sur les best practices de conversion
3. **Analyser les résultats** du manifest.json pour recommander les gagnants

Exemple de prompt pour Claude :

```
Génère 20 variations de headlines pour une offre de formation média buying.
Contraintes:
- 40-60 caractères
- Angle: peur de manquer, résultat rapide, preuve sociale, facilité
- Format JSON compatible avec creative-engine
```

---

## ✅ Avantages vs Canva/Figma

| Aspect | Creative Engine | Canva/Figma |
|--------|-----------------|-------------|
| **Volume** | Génération batch illimitée | Manuel, 1 par 1 |
| **Versioning** | Git, traçabilité complète | Historique limité |
| **Test A/B** | Matrices auto, 100+ variations | Fastidieux |
| **Coût** | Gratuit (open source) | Abonnement |
| **API** | Scriptable, CI/CD possible | API limitée/payante |
| **Qualité** | HTML=perfect pixels | Parfois compressé |

---

## 🚀 Prochaines étapes

1. Je te génère les fichiers de base dans ton workspace
2. Tu testes avec un cas concret
3. On itère pour ajouter des features (animations, vidéo, etc.)

Tu veux que je commence par créer la structure complète et un premier exemple fonctionnel ?
