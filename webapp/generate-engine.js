const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

async function generateCreative({ template, variation, width, height, outputDir }) {
  // Load template
  const templatePath = path.join(TEMPLATES_DIR, `${template}.html`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template non trouvé: ${template}`);
  }
  
  let html = fs.readFileSync(templatePath, 'utf-8');
  
  // Replace placeholders
  const replacements = {
    '{{width}}': width,
    '{{height}}': height,
    '{{headline}}': `${variation.headline_part1}${variation.headline_part2}`,
    '{{headline_part1}}': variation.headline_part1,
    '{{headline_part2}}': variation.headline_part2,
    '{{subheadline}}': variation.subheadline,
    '{{cta_text}}': variation.cta_text,
    '{{badge_text}}': variation.badge_text,
    '{{label_text}}': variation.label_text,
    '{{product_image}}': variation.product_image,
    '{{format}}': `${width}x${height}`,
    // Design tokens from config
    '{{bg_color}}': '#FFFFFF',
    '{{grid_opacity}}': '0.04',
    '{{orb_blur}}': '50',
    '{{orb1_size}}': '300',
    '{{orb1_color}}': 'rgba(0,0,0,0.08)',
    '{{orb1_opacity}}': '1',
    '{{orb1_top}}': '10',
    '{{orb1_left}}': '10',
    '{{orb2_size}}': '200',
    '{{orb2_color}}': 'rgba(0,0,0,0.05)',
    '{{orb2_opacity}}': '1',
    '{{orb2_bottom}}': '5',
    '{{orb2_right}}': '10',
    '{{padding}}': '48',
    '{{header_margin}}': '24',
    '{{label_size}}': '11',
    '{{label_color}}': '#666666',
    '{{logo_size}}': '18',
    '{{logo_color}}': '#111111',
    '{{logo_span_color}}': '#666666',
    '{{image_margin}}': '32',
    '{{product_width}}': Math.min(width * 0.7, 400),
    '{{product_height}}': Math.min(height * 0.5, 400),
    '{{product_radius}}': '16',
    '{{text_align}}': 'center',
    '{{headline_size}}': Math.min(width / 20, 48),
    '{{headline_color}}': '#999999',
    '{{headline_accent_color}}': '#111111',
    '{{headline_margin}}': '16',
    '{{subheadline_size}}': Math.min(width / 50, 18),
    '{{subheadline_color}}': '#666666',
    '{{subheadline_margin}}': '24',
    '{{badge_padding}}': '8',
    '{{badge_padding_h}}': '16',
    '{{badge_radius}}': '6',
    '{{badge_size}}': '12',
    '{{badge_bg}}': '#F3F4F6',
    '{{badge_color}}': '#333333',
    '{{badge_border}}': '1px solid #E5E7EB',
    '{{badge_margin}}': '16',
    '{{cta_padding_top}}': '8',
    '{{cta_padding}}': '16',
    '{{cta_padding_h}}': '32',
    '{{cta_radius}}': '8',
    '{{cta_size}}': '16',
    '{{cta_bg}}': '#111111',
    '{{cta_color}}': '#FFFFFF'
  };
  
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save file
  const fileName = `${variation.id}_${width}x${height}.html`;
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, html);
  
  return {
    fileName,
    path: filePath,
    width,
    height
  };
}

module.exports = { generateCreative };
