require('dotenv').config();

// Valida variáveis de ambiente obrigatórias antes de subir o servidor
const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error(`❌ Variáveis de ambiente faltando: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET === 'troque_esta_chave') {
  console.error('❌ JWT_SECRET ainda está com o valor padrão. Troque antes de iniciar.');
  process.exit(1);
}

const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
