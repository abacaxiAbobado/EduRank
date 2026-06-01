# EduRank - Plataforma de Aprendizado 🎓

## 📋 O que foi corrigido

✅ **Adicionado `index.html`** - Arquivo principal do frontend que estava faltando  
✅ **Configurado `app.js`** - Agora serve arquivos estáticos do frontend construído  
✅ **Atualizado `vite.config.js`** - Com proxy para API e configuração de build  
✅ **Removida estrutura confusa** - Limpeza de pastas desnecessárias  
✅ **Fallback para SPA** - Rotas não encontradas agora redirecionam para `index.html`

---

## 🚀 Como rodar o projeto

### 1️⃣ Instalar dependências

**Backend (Node.js/Express):**
```bash
cd App
npm install
```

**Frontend (React/Vite):**
```bash
cd ../Front
npm install
```

---

### 2️⃣ Configurar variáveis de ambiente

**Backend** - Copiar e editar `.env`:
```bash
cd App
cp .env.example .env
# Editar .env com seus dados reais
```

**Frontend** - Verificar `.env`:
```bash
cd ../Front
cat .env
# Deve apontar para http://localhost:3000 (ou seu backend)
```

---

### 3️⃣ Build do Frontend (IMPORTANTE!)

O backend serve arquivos do `Front/dist`. Você **precisa fazer build** do frontend primeiro:

```bash
cd Front
npm run build
```

Isso cria a pasta `dist/` com todos os arquivos otimizados.

---

### 4️⃣ Rodar o Backend

```bash
cd App
npm start
```

Ou com auto-reload (desenvolvimento):
```bash
npm run dev  # usa nodemon
```

O servidor vai rodar em: **http://localhost:3000**

---

## 🔄 Desenvolvimento (Modo Vite + Express separados)

Se preferir rodar frontend e backend **em paralelo** durante desenvolvimento:

**Terminal 1 - Backend:**
```bash
cd App
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Front
npm run dev
```

- Frontend roda em: **http://localhost:5173**
- Backend em: **http://localhost:3000**
- O Vite proxeia as chamadas de API automaticamente

---

## 📁 Estrutura final esperada

```
EduRank/
├── App/                          # Backend (Express)
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js               # ✅ CORRIGIDO
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── .env                      # ⚙️ Configure com seus dados
│   ├── .env.example
│   ├── package.json
│   └── node_modules/
│
└── Front/                        # Frontend (React + Vite)
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── styles/
    ├── public/
    ├── index.html                # ✅ CRIADO
    ├── vite.config.js            # ✅ CORRIGIDO
    ├── package.json
    ├── .env
    ├── dist/                      # 📦 Criado após `npm run build`
    └── node_modules/
```

---

## 🛠️ Troubleshooting

### Erro: "Cannot find module"
```bash
# Limpar dependências e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: "CORS não permitido"
- Edite `App/.env` e adicione sua URL em `ALLOWED_ORIGINS`
- Exemplo: `ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"`

### Erro: "Arquivo não encontrado" (404)
- Certifique-se de fazer `npm run build` no frontend
- Verifique se `Front/dist/` existe e tem arquivos
- Reinicie o backend após build do frontend

### Servidor não inicia
- Verifique `.env` - precisa de `DATABASE_URL` e `JWT_SECRET`
- Teste com: `node App/src/server.js`

---

## 📦 Scripts disponíveis

**Backend:**
```bash
npm start                    # Rodar servidor
npm run dev                  # Rodar com nodemon (auto-reload)
npm run prisma:migrate       # Executar migrações do Prisma
npm run prisma:studio        # Abrir Prisma Studio
```

**Frontend:**
```bash
npm run dev                  # Rodar dev server Vite
npm run build                # Build para produção
npm run preview              # Preview da build
```

---

## ✅ Teste rápido

Depois de rodar `npm start` no backend:

1. Abra: **http://localhost:3000**
2. Deve ver a página do frontend carregando
3. Verifique console do navegador (F12) por erros

---

## 🔐 Segurança

- ⚠️ Nunca commitar `.env` com chaves reais
- ⚠️ Trocar `JWT_SECRET` para uma chave forte em produção
- ✅ Usar `.env.example` para referência

---

Pronto! Seu projeto deve estar funcionando agora! 🎉
