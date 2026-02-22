#!/bin/bash
# Script de déploiement pour VPS Hostinger

echo "🚀 Démarrage du déploiement Creative Engine..."

# Aller dans le dossier
cd /root/creative-engine || exit 1

# Pull les dernières modifications
echo "📥 Pull du repo..."
git pull origin main

# Construire et démarrer avec Docker Compose
echo "🐳 Construction de l'image Docker..."
docker-compose down 2>/dev/null || true
docker-compose build --no-cache

echo "▶️  Démarrage du service..."
docker-compose up -d

# Vérifier le statut
echo "✅ Vérification du déploiement..."
sleep 5
docker-compose ps

echo ""
echo "🎉 Déploiement terminé !"
echo "🌐 L'app est accessible sur : http://72.61.195.204:3000"
echo ""
echo "📊 Logs en temps réel :"
docker-compose logs -f
