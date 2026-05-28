# EduRank API

API REST para a plataforma educacional EduRank.

## Instalação

1. Copie `.env.example` para `.env`
2. Execute `docker compose up -d`
3. Execute `npm install`
4. Execute `npx prisma migrate dev --name init`
5. Execute `npm run dev`

## Rotas

- POST /auth/register
- POST /auth/login
- GET /users/me
- GET /ranking
