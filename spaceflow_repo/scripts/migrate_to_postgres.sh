#!/bin/bash
# Script de migration SQLite vers PostgreSQL

echo "🚀 Préparation de la migration SQLite vers PostgreSQL..."

# 1. Vérification
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  ATTENTION: La variable DATABASE_URL n'est pas définie."
  echo "Veuillez définir DATABASE_URL dans votre fichier .env avec vos identifiants PostgreSQL."
  echo "Exemple: DATABASE_URL=\"postgresql://user:password@localhost:5432/rezidet\""
  echo "Arrêt du script."
  exit 1
fi

echo "✅ DATABASE_URL détectée."

# 2. Remplacement du provider dans schema.prisma
echo "🔄 Mise à jour de prisma/schema.prisma..."
# Utilisation de sed pour remplacer provider = "sqlite" par provider = "postgresql"
sed -i 's/provider = "sqlite"/provider = "postgresql"/g' backend/prisma/schema.prisma

# 3. Réinitialisation des migrations
echo "🗑️ Suppression des anciennes migrations SQLite..."
rm -rf backend/prisma/migrations

# 4. Génération de la première migration Postgres
echo "🏗️ Création de la migration initiale Postgres..."
cd backend
npx prisma migrate dev --name init_postgres

# 5. Injection des données de démo (Seed)
echo "🌱 Injection des données de test..."
node prisma/seed.js

echo "✅ Migration vers PostgreSQL terminée avec succès !"
