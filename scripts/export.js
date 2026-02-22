#!/usr/bin/env node

/**
 * Export HTML to PNG/JPEG
 * Usage: node scripts/export.js [campaign-folder] [format]
 * 
 * Examples:
 *   node scripts/export.js formation_mediatracking png
 *   node scripts/export.js ebook_tracking_gratuit jpeg
 *   node scripts/export.js all png
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function exportHTMLToImage(htmlPath, outputPath, format = 'png') {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Load HTML file
    const fileUrl = 'file://' + path.resolve(htmlPath);
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    
    // Wait for fonts to load
    await sleep(2000);
    
    // Get dimensions from the creative element
    const dimensions = await page.evaluate(() => {
      const creative = document.querySelector('.creative');
      if (creative) {
        return {
          width: creative.offsetWidth,
          height: creative.offsetHeight
        };
      }
      return { width: 1080, height: 1080 };
    });

    // Set viewport to match creative dimensions
    await page.setViewportSize({
      width: dimensions.width,
      height: dimensions.height
    });

    // Wait a bit for layout to settle
    await sleep(500);

    // Capture screenshot
    const element = await page.$('.creative');
    if (element) {
      const options = {
        path: outputPath,
        type: format === 'jpeg' ? 'jpeg' : 'png'
      };
      
      if (format === 'jpeg') {
        options.quality = 90;
      }
      
      await element.screenshot(options);
    } else {
      // Fallback to full page screenshot
      await page.screenshot({
        path: outputPath,
        type: format === 'jpeg' ? 'jpeg' : 'png',
        fullPage: true
      });
    }

    await browser.close();
    return true;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function exportCampaign(campaignName, format = 'png') {
  const campaignDir = path.join(OUTPUT_DIR, campaignName);
  
  if (!fs.existsSync(campaignDir)) {
    console.error(`❌ Campagne non trouvée: ${campaignName}`);
    console.log('Campagnes disponibles:');
    listCampaigns();
    return;
  }

  // Create images subdirectory
  const imagesDir = path.join(campaignDir, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Find all HTML files
  const files = fs.readdirSync(campaignDir)
    .filter(f => f.endsWith('.html') && !f.includes('manifest'))
    .sort();

  if (files.length === 0) {
    console.error(`❌ Aucun fichier HTML trouvé dans ${campaignName}`);
    return;
  }

  console.log(`\n🖼️  Export de ${files.length} créatives vers ${format.toUpperCase()}...\n`);

  const exported = [];
  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const htmlPath = path.join(campaignDir, file);
    const outputName = file.replace('.html', `.${format}`);
    const outputPath = path.join(imagesDir, outputName);

    process.stdout.write(`[${i + 1}/${files.length}] ${file}... `);

    try {
      await exportHTMLToImage(htmlPath, outputPath, format);
      process.stdout.write(`✓\n`);
      exported.push(outputName);
    } catch (error) {
      process.stdout.write(`✗\n`);
      errors.push({ file, error: error.message });
    }
  }

  // Print summary
  console.log(`\n✅ ${exported.length} fichiers exportés dans:`);
  console.log(`   ${imagesDir}\n`);

  if (errors.length > 0) {
    console.log(`⚠️  ${errors.length} erreurs:`);
    errors.forEach(e => console.log(`   - ${e.file}: ${e.error}`));
  }

  // Update manifest with image paths
  const manifestPath = path.join(campaignDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    manifest.exported_images = exported.map(f => ({
      filename: f,
      format: format,
      path: `images/${f}`
    }));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('📄 Manifest mis à jour avec les chemins des images');
  }
}

async function exportAll(format = 'png') {
  const campaigns = fs.readdirSync(OUTPUT_DIR)
    .filter(f => {
      const fullPath = path.join(OUTPUT_DIR, f);
      return fs.statSync(fullPath).isDirectory();
    });

  console.log(`\n🚀 Export de ${campaigns.length} campagnes...\n`);

  for (const campaign of campaigns) {
    await exportCampaign(campaign, format);
  }
}

function listCampaigns() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log('❌ Aucune campagne trouvée');
    return;
  }

  const campaigns = fs.readdirSync(OUTPUT_DIR)
    .filter(f => {
      const fullPath = path.join(OUTPUT_DIR, f);
      return fs.statSync(fullPath).isDirectory();
    });

  if (campaigns.length === 0) {
    console.log('❌ Aucune campagne trouvée');
    return;
  }

  console.log('\n📁 Campagnes disponibles:\n');
  campaigns.forEach(c => {
    const manifestPath = path.join(OUTPUT_DIR, c, 'manifest.json');
    let info = '';
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const htmlCount = fs.readdirSync(path.join(OUTPUT_DIR, c))
        .filter(f => f.endsWith('.html')).length;
      info = `(${htmlCount} fichiers HTML)`;
    }
    console.log(`   • ${c} ${info}`);
  });
  console.log('');
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const format = (args[1] || 'png').toLowerCase();

  if (!['png', 'jpeg', 'jpg'].includes(format)) {
    console.error(`❌ Format non supporté: ${format}`);
    console.log('Formats supportés: png, jpeg');
    process.exit(1);
  }

  const finalFormat = format === 'jpg' ? 'jpeg' : format;

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      console.log(`
🖼️  Creative Engine - Export vers PNG/JPEG

Usage:
  node scripts/export.js [commande] [format]

Commandes:
  all [format]          Exporter toutes les campagnes
  <nom-campagne> [fmt]  Exporter une campagne spécifique
  list                  Lister les campagnes disponibles
  help                  Afficher cette aide

Formats:
  png   (défaut)        PNG transparent, haute qualité
  jpeg                  JPEG compressé, plus léger

Exemples:
  node scripts/export.js formation_mediatracking png
  node scripts/export.js ebook_tracking_gratuit jpeg
  node scripts/export.js all png
      `);
      break;

    case 'list':
    case 'ls':
      listCampaigns();
      break;

    case 'all':
      await exportAll(finalFormat);
      break;

    default:
      await exportCampaign(command, finalFormat);
  }
}

main().catch(error => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});
