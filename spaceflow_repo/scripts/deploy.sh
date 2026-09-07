#!/bin/bash
set -euo pipefail

echo "🚀 Déploiement CAFM Pro - Production"
echo "====================================="

# Vérifications préalables
command -v node >/dev/null 2>&1 || { echo "❌ Node.js requis"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker requis"; exit 1; }

# Vérifier variables d'environnement
if [ -z "${JWT_SECRET:-}" ]; then
  echo "❌ JWT_SECRET manquant"
  exit 1
fi

# 1. Backup base de données
echo "📦 Backup base de données..."
./scripts/backup-db.sh

# 2. Pull dernier code
echo "📥 Pull du code..."
git pull origin main

# 3. Build et déployer avec Docker
echo "🐳 Build des images Docker..."
docker-compose build --no-cache

echo "🚀 Démarrage des services..."
docker-compose up -d

# 4. Migrations Prisma
echo "🗃️  Migrations base de données..."
docker-compose exec -T backend npx prisma migrate deploy

# 5. Health check
echo "🏥 Vérification santé..."
sleep 10
HEALTH=$(curl -s http://localhost:5000/api/health | jq -r '.status' 2>/dev/null || echo "ERROR")

if [ "$HEALTH" = "OK" ]; then
  echo "✅ Déploiement réussi !"
  echo "📊 API: https://api.cafm.app"
  echo "📚 Docs: https://api.cafm.app/api-docs"
else
  echo "❌ Health check échoué: $HEALTH"
  echo "🔍 Logs:"
  docker-compose logs --tail=50 backend
  exit 1
fi
