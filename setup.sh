#!/bin/bash

echo "🚀 Iniciando setup do EduRank..."
echo ""

# Backend setup
echo "📦 Instalando dependências do Backend..."
cd App
npm install
echo "✅ Backend dependencies instaladas"
echo ""

# Criar .env se não existir
if [ ! -f .env ]; then
    echo "⚙️  Criando arquivo .env do backend..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edite App/.env com suas credenciais antes de rodar!"
fi
echo ""

# Frontend setup
echo "📦 Instalando dependências do Frontend..."
cd ../Front
npm install
echo "✅ Frontend dependencies instaladas"
echo ""

# Build frontend
echo "🔨 Fazendo build do Frontend para produção..."
npm run build
echo "✅ Frontend build concluído!"
echo ""

echo "========================================"
echo "✅ Setup concluído com sucesso!"
echo "========================================"
echo ""
echo "🎯 Próximos passos:"
echo "1. Edite as variáveis de ambiente:"
echo "   • App/.env (DATABASE_URL, JWT_SECRET)"
echo "   • Front/.env (API_URL)"
echo ""
echo "2. Inicie o backend:"
echo "   cd App && npm start"
echo ""
echo "3. Abra o navegador em:"
echo "   http://localhost:3000"
echo ""
echo "💡 Para desenvolvimento com auto-reload:"
echo "   Terminal 1: cd App && npm run dev"
echo "   Terminal 2: cd Front && npm run dev"
echo ""
