const fs = require('fs');
const path = require('path');

/**
 * Générateur de configurations A/B
 * Crée des matrices de test avec toutes les combinaisons pertinentes
 */

class ABTestGenerator {
  constructor() {
    // Hooks copywriting éprouvés
    this.headlines = {
      urgency: [
        "Derniers jours pour en profiter",
        "Ça se termine ce soir minuit",
        "Plus que 48h avant la fin"
      ],
      scarcity: [
        "Seulement 7 places disponibles",
        "Stock limité - Acte vite",
        "Édition limitée - Ne loupe pas ça"
      ],
      social_proof: [
        "Rejoins les +10,000 entrepreneurs",
        "Déjà 500 freelances formés",
        "La méthode qui cartonne en 2026"
      ],
      result: [
        "Tes premiers clients en 7 jours",
        "Résultats garantis ou remboursés",
        "10x ton CA en 90 jours chrono"
      ],
      ease: [
        "Sans expérience, sans budget",
        "Même si tu pars de zéro",
        "La méthode clé-en-main"
      ],
      objection: [
        "Arrête de perdre du temps",
        "Finis les mois difficiles",
        "Ne paye que si ça marche"
      ]
    };

    this.ctas = [
      { text: "J'en profite →", color: "#FF6B6B", textColor: "#FFFFFF" },
      { text: "Découvrir la méthode", color: "#4ECDC4", textColor: "#FFFFFF" },
      { text: "Réserver ma place", color: "#FFE66D", textColor: "#1a1a2e" },
      { text: "Commencer maintenant", color: "#95E1D3", textColor: "#1a1a2e" }
    ];

    this.badges = [
      { text: "-50%", color: "#FF4757" },
      { text: "NOUVEAU", color: "#2ED573" },
      { text: "TOP VENTES", color: "#FFA502" },
      { text: "LIMITÉ", color: "#3742FA" }
    ];

    this.palettes = [
      { color1: "#667eea", color2: "#764ba2", text: "#FFFFFF" },
      { color1: "#f093fb", color2: "#f5576c", text: "#FFFFFF" },
      { color1: "#4facfe", color2: "#00f2fe", text: "#FFFFFF" },
      { color1: "#43e97b", color2: "#38f9d7", text: "#FFFFFF" },
      { color1: "#fa709a", color2: "#fee140", text: "#FFFFFF" },
      { color1: "#30cfd0", color2: "#330867", text: "#FFFFFF" }
    ];
  }

  generateMatrix(campaignName, options = {}) {
    const {
      productImage = 'assets/product.png',
      maxVariations = 24,
      angles = ['urgency', 'scarcity', 'social_proof', 'result'],
      formats = ["1080x1080", "1200x628", "1080x1920"]
    } = options;

    const variations = [];
    let counter = 1;

    // Génère des combinaisons équilibrées
    for (const angle of angles) {
      const headlines = this.headlines[angle] || this.headlines.result;
      
      for (let h = 0; h < headlines.length && counter <= maxVariations; h++) {
        const cta = this.ctas[counter % this.ctas.length];
        const badge = this.badges[counter % this.badges.length];
        const palette = this.palettes[counter % this.palettes.length];

        variations.push({
          id: `v${counter}_${angle}`,
          headline: headlines[h],
          subheadline: this.generateSubheadline(angle),
          cta_text: cta.text,
          cta_color: cta.color,
          cta_text_color: cta.textColor,
          badge_text: badge.text,
          badge_color: badge.color,
          bg_color1: palette.color1,
          bg_color2: palette.color2,
          text_color: palette.text,
          product_image: productImage
        });

        counter++;
      }
    }

    return {
      campaign: campaignName,
      template: "single-product",
      formats: formats,
      base_config: {
        font_family: "Poppins",
        headline_size: 72,
        subheadline_size: 32,
        cta_size: 28,
        product_width: 450,
        product_height: 450
      },
      variations: variations
    };
  }

  generateSubheadline(angle) {
    const subheadlines = {
      urgency: ["Offre valable jusqu'à ce soir minuit", "Ne rate pas cette opportunité"],
      scarcity: ["Dernières places disponibles", "Ça part très vite"],
      social_proof: ["Rejoins la communauté des pros", "Ils ont déjà sauté le pas"],
      result: ["La méthode qui change tout", "Des résultats dès la première semaine"],
      ease: ["Simple, rapide, efficace", "Même débutant friendly"],
      objection: ["Arrête de te prendre la tête", "La solution est là"]
    };
    const options = subheadlines[angle] || subheadlines.result;
    return options[Math.floor(Math.random() * options.length)];
  }

  saveConfig(campaignName, options = {}) {
    const config = this.generateMatrix(campaignName, options);
    const filename = `${campaignName}_ab_test.json`;
    const configsDir = path.join(__dirname, '..', 'configs');
    const filepath = path.join(configsDir, filename);

    fs.mkdirSync(configsDir, { recursive: true });
    fs.writeFileSync(filepath, JSON.stringify(config, null, 2));

    console.log(`✅ Config A/B générée: ${filepath}`);
    console.log(`📊 ${config.variations.length} variations prêtes à tester`);
    console.log(`📐 Formats: ${config.formats.join(', ')}`);

    return filepath;
  }
}

// CLI
if (require.main === module) {
  const campaignName = process.argv[2] || 'campaign_test';
  const productImage = process.argv[3] || 'assets/product.png';
  
  const generator = new ABTestGenerator();
  generator.saveConfig(campaignName, { productImage });
}

module.exports = ABTestGenerator;
