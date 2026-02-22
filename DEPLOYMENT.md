# 🌐 Déploiement Web App

Guide pour déployer la Creative Engine Web App sur ton VPS Hostinger.

## 📋 Prérequis

- VPS Hostinger (ou autre) avec Ubuntu/Debian
- Node.js 18+ installé
- Accès SSH au serveur
- (Optionnel) Nginx pour le reverse proxy

## 🚀 Déploiement Rapide

### 1. Connexion au serveur

```bash
ssh root@ton-ip-hostinger
cd /var/www  # ou ton dossier de projets
```

### 2. Cloner le repo

```bash
git clone https://github.com/sebastien-collab/creative-engine.git
cd creative-engine
```

### 3. Installer les dépendances

```bash
npm install
npx playwright install chromium
```

### 4. Lancer l'application

```bash
npm run webapp
```

L'app sera accessible sur : `http://ton-ip-hostinger:3000`

---

## 🔒 Production avec PM2 (recommandé)

### 1. Installer PM2

```bash
npm install -g pm2
```

### 2. Lancer avec PM2

```bash
npm run webapp:pm2
```

### 3. Configurer le démarrage auto

```bash
pm2 startup
pm2 save
```

### 4. Commandes PM2 utiles

```bash
pm2 status                    # Voir le statut
pm2 logs creative-engine      # Voir les logs
pm2 restart creative-engine   # Redémarrer
pm2 stop creative-engine      # Arrêter
```

---

## 🌐 Configuration Nginx (recommandé)

Pour avoir un domaine propre avec HTTPS :

### 1. Créer le fichier de config

```bash
sudo nano /etc/nginx/sites-available/creative-engine
```

### 2. Contenu du fichier

```nginx
server {
    listen 80;
    server_name creative.tondomaine.com;  # Ton sous-domaine

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 50M;  # Pour l'upload d'images
}
```

### 3. Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/creative-engine /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. HTTPS avec Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d creative.tondomaine.com
```

---

## ⚙️ Configuration

### Variables d'environnement (optionnel)

Créer un fichier `.env` dans `webapp/` :

```env
PORT=3000
NODE_ENV=production
UPLOAD_DIR=./uploads
OUTPUT_DIR=./output
```

### Firewall

```bash
# Ouvrir le port 3000 (si pas de Nginx)
sudo ufw allow 3000

# Ou juste 80/443 (avec Nginx)
sudo ufw allow 'Nginx Full'
```

---

## 📁 Structure sur le serveur

```
/var/www/creative-engine/
├── webapp/
│   ├── server.js           # Serveur Express
│   ├── generate-engine.js  # Logique de génération
│   └── public/
│       └── index.html      # Interface web
├── templates/              # Templates HTML
├── output/                 # Créatives générées
├── uploads/                # Images uploadées
├── package.json
└── ...
```

---

## 🔄 Mise à jour

```bash
cd /var/www/creative-engine
git pull
npm install
pm2 restart creative-engine
```

---

## 🐛 Dépannage

### Problème : Playwright ne trouve pas Chromium

```bash
npx playwright install chromium
# ou
npx playwright install-deps chromium
```

### Problème : Permission denied sur uploads/

```bash
chmod 755 uploads output
```

### Problème : Port 3000 déjà utilisé

```bash
# Vérifier ce qui utilise le port
sudo lsof -i :3000

# Tuer le processus ou changer de port
# Dans webapp/server.js ou .env, changer PORT=3001
```

---

## 📊 Monitoring

### Avec PM2

```bash
pm2 monit                    # Interface de monitoring
pm2 logs creative-engine --lines 100
```

### Avec Nginx logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 💡 Conseils

- **Stockage** : Les images générées prennent de la place (~300-500KB chacune). Surveille l'espace disque.
- **Backup** : Les configs JSON et templates sont dans Git. Les uploads et output sont à sauvegarder séparément.
- **Sécurité** : Utilise toujours Nginx + HTTPS en production.
- **Performance** : Pour +10 utilisateurs simultanés, envisage un VPS avec 2GB+ RAM.

---

## 🆘 Support

Si tu bloques :
1. Vérifie les logs : `pm2 logs creative-engine`
2. Teste en local d'abord : `npm run webapp`
3. Vérifie que Chromium est bien installé : `npx playwright chromium --help`
