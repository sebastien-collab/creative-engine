const fs = require('fs');
const path = require('path');

/**
 * Creative Engine - Générateur de créatives
 * Rendu HTML → PNG via Playwright (sans Puppeteer, plus léger)
 */

class CreativeEngine {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.templatesDir = path.join(this.rootDir, 'templates');
    this.configsDir = path.join(this.rootDir, 'configs');
    this.outputDir = path.join(this.rootDir, 'output');
    this.assetsDir = path.join(this.rootDir, 'assets');
  }

  /**
   * Compile un template Handlebars-like simple
   */
  compileTemplate(templatePath, data) {
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Remplace {{variable}} par la valeur
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, data[key]);
    });
    
    return template;
  }

  /**
   * Génère les créatives depuis une config JSON
   */
  async generateFromConfig(configPath) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const templatePath = path.join(this.templatesDir, `${config.template}.html`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template non trouvé: ${templatePath}`);
    }

    const results = [];
    const campaignDir = path.join(this.outputDir, config.campaign);
    fs.mkdirSync(campaignDir, { recursive: true });

    console.log(`🎨 Génération de ${config.variations.length} variations × ${config.formats.length} formats...\n`);

    for (const format of config.formats) {
      const [width, height] = format.split('x').map(Number);
      
      for (const variation of config.variations) {
        const data = {
          ...config.base_config,
          ...variation,
          width,
          height
        };

        // Ajuste les tailles selon le format
        if (format === '1200x628') { // Facebook Ads
          data.headline_size = 56;
          data.subheadline_size = 28;
          data.product_width = 380;
          data.product_height = 380;
        } else if (format === '1080x1920') { // Stories/Reels
          data.headline_size = 64;
          data.subheadline_size = 30;
          data.product_width = 520;
          data.product_height = 520;
        }

        const html = this.compileTemplate(templatePath, data);
        const filename = `${config.campaign}_${variation.id}_${format}.html`;
        const outputPath = path.join(campaignDir, filename);

        fs.writeFileSync(outputPath, html);
        
        results.push({
          campaign: config.campaign,
          variation: variation.id,
          format,
          htmlPath: outputPath,
          elements: {
            headline: variation.headline,
            cta: variation.cta_text,
            badge: variation.badge_text
          }
        });

        process.stdout.write(`✓ ${filename}\n`);
      }
    }

    // Sauvegarde le manifest
    const manifestPath = path.join(campaignDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      total: results.length,
      results
    }, null, 2));

    console.log(`\n✅ ${results.length} créatives générées dans: ${campaignDir}/`);
    console.log(`📄 Manifest: ${manifestPath}`);

    return results;
  }

  /**
   * Exporte les HTML en PNG (nécessite Playwright ou Puppeteer)
   */
  async exportToPng(campaignName) {
    console.log('\n🖼️  Export PNG en cours...');
    
    try {
      const { chromium } = require('playwright');
      const browser = await chromium.launch();
      
      const campaignDir = path.join(this.outputDir, campaignName);
      const manifestPath = path.join(campaignDir, 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      for (const item of manifest.results) {
        const page = await browser.newPage();
        const htmlContent = fs.readFileSync(item.htmlPath, 'utf8');
        
        // Extrait les dimensions du filename
        const format = item.format;
        const [width, height] = format.split('x').map(Number);
        
        await page.setViewportSize({ width, height });
        await page.setContent(htmlContent, { waitUntil: 'networkidle' });
        
        // Attend le chargement des fonts Google
        await page.waitForTimeout(1000);
        
        const pngPath = item.htmlPath.replace('.html', '.png');
        await page.screenshot({ path: pngPath, type: 'png' });
        await page.close();
        
        process.stdout.write(`✓ ${path.basename(pngPath)}\n`);
      }

      await browser.close();
      console.log(`\n✅ Export PNG terminé!`);
      
    } catch (error) {
      console.log(`\n⚠️  Export PNG ignoré - Playwright non installé`);
      console.log(`   Pour exporter en PNG, installe: npm install playwright`);
      console.log(`   Les fichiers HTML sont prêts pour conversion manuelle.`);
    }
  }

  /**
   * Liste les campagnes générées
   */
  listCampaigns() {
    if (!fs.existsSync(this.outputDir)) {
      console.log('Aucune campagne générée');
      return;
    }

    const campaigns = fs.readdirSync(this.outputDir)
      .filter(f => fs.statSync(path.join(this.outputDir, f)).isDirectory());

    console.log('\n📁 Campagnes générées:');
    campaigns.forEach(c => {
      const manifestPath = path.join(this.outputDir, c, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        console.log(`  • ${c} - ${manifest.total} créatives`);
      }
    });
  }
}

// CLI
async function main() {
  const command = process.argv[2];
  const engine = new CreativeEngine();

  switch (command) {
    case 'generate':
    case 'gen': {
      const configFile = process.argv[3];
      if (!configFile) {
        console.log('Usage: node generate.js generate <config-file.json>');
        process.exit(1);
      }
      const configPath = path.join(engine.configsDir, configFile);
      if (!fs.existsSync(configPath)) {
        console.error(`❌ Config non trouvée: ${configPath}`);
        process.exit(1);
      }
      await engine.generateFromConfig(configPath);
      break;
    }

    case 'export': {
      const campaignName = process.argv[3];
      if (!campaignName) {
        console.log('Usage: node generate.js export <campaign-name>');
        process.exit(1);
      }
      await engine.exportToPng(campaignName);
      break;
    }

    case 'list':
      engine.listCampaigns();
      break;

    default:
      console.log(`
🎨 Creative Engine - Usage:

  node generate.js generate <config.json>   Génère les créatives HTML
  node generate.js export <campaign>        Exporte en PNG (nécessite Playwright)
  node generate.js list                     Liste les campagnes générées

Exemples:
  node generate.js generate mycampaign.json
  node generate.js export mycampaign
      `);
  }
}

main().catch(console.error);
