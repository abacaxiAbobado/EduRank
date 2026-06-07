# Instruções de Migration

O schema foi atualizado com 3 novos campos e 1 nova tabela.
Execute os comandos abaixo após substituir os arquivos:

```bash
cd App
npx prisma migrate dev --name add_suspension_and_acertos
```

Isso irá:
- Adicionar `suspended`, `suspendedReason`, `suspendedUntil` no modelo `User`
- Criar a tabela `AcertoQuestao` para rastrear questões já acertadas por usuário
- Adicionar `explicacao` no modelo `Questao`
- Alterar `autorId` de Int para String (UUID) — **atenção: se já tiver dados, faça backup antes**

## ⚠️ Se o banco já tiver dados de produção

O campo `autorId` mudou de `Int` para `String` (UUID).
Se já houver quizzes criados no banco antigo, rode:

```bash
npx prisma migrate dev --create-only --name add_suspension_and_acertos
```

Edite o arquivo SQL gerado para tratar a conversão de tipos manualmente antes de aplicar.

Se o banco estiver vazio (novo deploy), pode rodar diretamente:

```bash
npx prisma migrate dev --name init
```
