#!/bin/bash
echo "📦 Instalando dependencias con legacy-peer-deps..."
npm install --legacy-peer-deps --force

echo "🔨 Construyendo el proyecto..."
npm run build