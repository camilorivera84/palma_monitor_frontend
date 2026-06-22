#!/bin/bash
echo "🧹 Limpiando node_modules y package-lock.json..."
rm -rf node_modules package-lock.json

echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps --force

echo "🔨 Construyendo el proyecto..."
npm run build