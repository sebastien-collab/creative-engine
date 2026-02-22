const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { generateCreative } = require('./generate-engine');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// In-memory storage for generated campaigns
const campaigns = new Map();

// Generate headline variations using templates
function generateHeadlineVariations(productName, angle) {
  const templates = {
    urgency: [
      { part1: "Ne perds plus ", part2: "30% de ROAS" },
      { part1: "Dernières places pour ", part2: productName },
      { part1: "Ça se termine dans ", part2: "48h" },
    ],
    result: [
      { part1: "Tes premiers clients ", part2: "en 7 jours" },
      { part1: "Passe à ", part2: "10k€/mois" },
      { part1: "Scale ton business avec ", part2: productName },
    ],
    proof: [
      { part1: "Rejoins les ", part2: "500+ freelances" },
      { part1: "La méthode de ", part2: "200+ pros" },
      { part1: "Déjà ", part2: "+1000 élèves formés" },
    ],
    ease: [
      { part1: "Sans ", part2: "te prendre la tête" },
      { part1: "Configuration en ", part2: "48h chrono" },
      { part1: "Clé en main pour ", part2: productName },
    ],
    transformation: [
      { part1: "De 0 à ", part2: "10k€/mois" },
      { part1: "Ta transformation ", part2: "commence ici" },
      { part1: "Le before/after de ", part2: productName },
    ],
    guarantee: [
      { part1: "Résultats ou ", part2: "remboursés" },
      { part1: "30 jours pour ", part2: "tester sans risque" },
      { part1: "Satisfait ou ", part2: "100% remboursé" },
    ]
  };
  
  return templates[angle] || templates.result;
}

// Generate subheadlines
function generateSubheadlines(productName, angle) {
  const templates = {
    urgency: [
      "Configure ton tracking correctement. Résultats dès la première semaine.",
      "Ne laisse pas ton concurrent prendre ta place.",
      "Les dernières places partent vite."
    ],
    result: [
      "La méthode validée par les pros du media buying. Même si tu pars de zéro.",
      "Tout ce dont tu as besoin pour scaler tes campagnes.",
      "Les stratégies qui fonctionnent en 2025."
    ],
    proof: [
      "La communauté des pros du tracking. Formation complète Hyros + GA4.",
      "Rejoins ceux qui ne devinent plus, qui mesurent.",
      "Le réseau qui change tout pour ton business."
    ],
    ease: [
      "Configuration complète en 48h. Accompagnement 1-on-1 inclus.",
      "On s'occupe de tout. Toi, tu focuses sur tes clients.",
      "Pas besoin d'être technique. On te guide pas à pas."
    ],
    transformation: [
      "Comment Thomas a scale son agence grâce au tracking avancé.",
      "Le parcours de zéro à six chiffres.",
      "Ta success story commence aujourd'hui."
    ],
    guarantee: [
      "30 jours pour tester. Pas satisfait ? On te rembourse. Sans justification.",
      "Zero risque. Tout le gain.",
      "On prend tous les risques à ta place."
    ]
  };
  
  return templates[angle] || templates.result;
}

// Main generation endpoint
app.post('/api/generate', upload.single('screenshot'), async (req, res) => {
  try {
    const { productName, angle, format, template: templateName } = req.body;
    const screenshotPath = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Generate variations
    const headlines = generateHeadlineVariations(productName, angle);
    const subheadlines = generateSubheadlines(productName, angle);
    
    const variations = headlines.map((h, i) => ({
      id: `v${i + 1}_${angle}`,
      headline_part1: h.part1,
      headline_part2: h.part2,
      subheadline: subheadlines[i % subheadlines.length],
      cta_text: angle === 'urgency' ? 'Réserver maintenant' : 
                angle === 'result' ? 'Découvrir la méthode' :
                angle === 'proof' ? 'Rejoindre les insiders' :
                angle === 'ease' ? 'Commencer maintenant' :
                angle === 'transformation' ? 'Lire la success story' :
                'Tester sans risque',
      badge_text: angle === 'urgency' ? 'DERNIÈRES PLACES' :
                  angle === 'result' ? '+500 ÉLÈVES' :
                  angle === 'proof' ? 'TOP VENTES' :
                  angle === 'ease' ? 'CLÉ EN MAIN' :
                  angle === 'transformation' ? 'SUCCESS STORY' :
                  'GARANTIE',
      label_text: 'FORMATION',
      product_image: screenshotPath || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=800&fit=crop'
    }));
    
    // Create campaign config
    const campaignId = `campaign_${Date.now()}`;
    const campaign = {
      id: campaignId,
      name: `${productName} - ${angle}`,
      template: templateName || 'impulsion-chart',
      formats: format ? [format] : ['1080x1080', '1200x628', '1080x1920'],
      createdAt: new Date().toISOString(),
      variations: variations
    };
    
    campaigns.set(campaignId, campaign);
    
    // Generate HTML files (path corrected for Docker structure)
    const outputDir = path.join(__dirname, '..', 'output', campaignId);
    const generatedFiles = [];
    
    for (const variation of variations) {
      for (const fmt of campaign.formats) {
        const [width, height] = fmt.split('x').map(Number);
        const result = await generateCreative({
          template: campaign.template,
          variation,
          width,
          height,
          outputDir
        });
        generatedFiles.push(result);
      }
    }
    
    res.json({
      success: true,
      campaignId,
      message: `${generatedFiles.length} créatives générées`,
      preview: `/preview/${campaignId}`,
      download: `/download/${campaignId}`,
      files: generatedFiles
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Preview endpoint
app.get('/preview/:campaignId', (req, res) => {
  const { campaignId } = req.params;
  const campaign = campaigns.get(campaignId);
  
  if (!campaign) {
    return res.status(404).send('Campagne non trouvée');
  }
  
  const htmlFiles = fs.readdirSync(path.join(__dirname, 'output', campaignId))
    .filter(f => f.endsWith('.html'));
  
  let previews = htmlFiles.map(file => {
    const format = file.match(/(\d+x\d+)/)?.[1] || 'unknown';
    return `
      <div class="preview-card">
        <h4>${file}</h4>
        <iframe src="/output/${campaignId}/${file}" width="400" height="400" style="border:1px solid #ddd;transform:scale(0.5);transform-origin:top left;width:800px;height:800px;"></iframe>
        <div class="format-badge">${format}</div>
      </div>
    `;
  }).join('');
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Aperçu - ${campaign.name}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; background: #f5f5f5; }
        h1 { margin-bottom: 30px; }
        .preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 30px; }
        .preview-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .preview-card h4 { margin: 0 0 15px 0; font-size: 14px; color: #666; }
        .preview-card iframe { display: block; margin: 0 auto; }
        .format-badge { display: inline-block; background: #111; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 10px; }
        .actions { margin-top: 30px; }
        .btn { display: inline-block; background: #111; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-right: 10px; }
      </style>
    </head>
    <body>
      <h1>🎨 ${campaign.name}</h1>
      <p>Template: ${campaign.template} | ${campaign.formats.join(', ')}</p>
      <div class="preview-grid">
        ${previews}
      </div>
      <div class="actions">
        <a href="/download/${campaignId}" class="btn">📥 Télécharger tout (ZIP)</a>
        <a href="/export/${campaignId}/png" class="btn">🖼️ Exporter PNG</a>
        <a href="/" class="btn" style="background:#666;">← Nouvelle campagne</a>
      </div>
    </body>
    </html>
  `);
});

// Export to PNG
app.get('/export/:campaignId/:format', async (req, res) => {
  const { campaignId, format } = req.params;
  const campaignDir = path.join(__dirname, '..', 'output', campaignId);
  
  if (!fs.existsSync(campaignDir)) {
    return res.status(404).send('Campagne non trouvée');
  }
  
  const htmlFiles = fs.readdirSync(campaignDir).filter(f => f.endsWith('.html'));
  const imagesDir = path.join(campaignDir, 'images');
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    for (const file of htmlFiles) {
      const htmlPath = path.join(campaignDir, file);
      const outputPath = path.join(imagesDir, file.replace('.html', `.${format}`));
      
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      
      await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
      await new Promise(r => setTimeout(r, 2000));
      
      const dimensions = await page.evaluate(() => {
        const el = document.querySelector('.creative');
        return el ? { width: el.offsetWidth, height: el.offsetHeight } : { width: 1080, height: 1080 };
      });
      
      await page.setViewportSize(dimensions);
      await new Promise(r => setTimeout(r, 500));
      
      const element = await page.$('.creative');
      if (element) {
        await element.screenshot({ 
          path: outputPath, 
          type: format === 'jpeg' ? 'jpeg' : 'png',
          quality: format === 'jpeg' ? 90 : undefined
        });
      }
      
      await context.close();
    }
    
    await browser.close();
    
    res.json({ 
      success: true, 
      message: `${htmlFiles.length} images exportées`,
      imagesDir: `/output/${campaignId}/images`
    });
    
  } catch (error) {
    await browser.close();
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve output files (corrected paths for Docker)
app.use('/output', express.static(path.join(__dirname, '..', 'output')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Creative Engine Web running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`📁 Output directory: ${path.join(__dirname, 'output')}`);
});
