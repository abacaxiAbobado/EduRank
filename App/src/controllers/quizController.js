const prisma = require('../utils/prisma');

// Listar todos os quizzes
exports.getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      select: {
        id: true,
        titulo: true,
        descricao: true,
        createdAt: true,
        autor: { select: { name: true, level: true } },
        _count: { select: { questoes: true } }
      }
    });

    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

// Buscar um quiz pelo id (sem revelar respostas)
exports.getQuizById = async (req, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        autor: { select: { name: true } },
        questoes: {
          select: {
            id: true,
            pergunta: true,
            alternativas: true
            // respostaCorreta NÃO é enviada
          }
        }
      }
    });

    if (!quiz)
      return res.status(404).json({ error: 'Quiz não encontrado.' });

    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

// Criar quiz (apenas nível 3+)
exports.createQuiz = async (req, res, next) => {
  try {
    const { titulo, descricao, questoes } = req.body;

    if (!titulo || !questoes || !Array.isArray(questoes) || questoes.length === 0)
      return res.status(400).json({ error: 'Título e ao menos uma questão são obrigatórios.' });

    for (const q of questoes) {
      if (!q.pergunta || !Array.isArray(q.alternativas) || q.alternativas.length < 2 || !q.respostaCorreta)
        return res.status(400).json({ error: 'Cada questão deve ter pergunta, ao menos 2 alternativas e uma resposta correta.' });

      if (!q.alternativas.includes(q.respostaCorreta))
        return res.status(400).json({ error: 'A resposta correta deve ser uma das alternativas.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { level: true }
    });

    if (user.level < 3)
      return res.status(403).json({
        error: 'Você precisa estar no nível 3 para criar quizzes.'
      });

    const quiz = await prisma.quiz.create({
      data: {
        titulo,
        descricao,
        autorId: req.userId,
        questoes: {
          create: questoes.map(q => ({
            pergunta: q.pergunta,
            alternativas: q.alternativas,
            respostaCorreta: q.respostaCorreta
          }))
        }
      },
      include: { questoes: true }
    });

    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
};

// Responder quiz e calcular pontos
exports.responderQuiz = async (req, res, next) => {
  try {
    const { respostas } = req.body;

    if (!respostas || !Array.isArray(respostas) || respostas.length === 0)
      return res.status(400).json({ error: 'Respostas são obrigatórias.' });

    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(req.params.id) },
      include: { questoes: true }
    });

    if (!quiz)
      return res.status(404).json({ error: 'Quiz não encontrado.' });

    // Impede responder o mesmo quiz mais de uma vez
    const jaRespondeu = await prisma.resultado.findFirst({
      where: { usuarioId: req.userId, quizId: quiz.id }
    });

    if (jaRespondeu)
      return res.status(409).json({ error: 'Você já respondeu este quiz.' });

    // Corrige as respostas
    let acertos = 0;
    const resultado = quiz.questoes.map(questao => {
      const respostaUsuario = respostas.find(r => r.questaoId === questao.id);
      const acertou = respostaUsuario?.resposta === questao.respostaCorreta;
      if (acertou) acertos++;

      return {
        questaoId: questao.id,
        pergunta: questao.pergunta,
        respostaUsuario: respostaUsuario?.resposta,
        respostaCorreta: questao.respostaCorreta,
        acertou
      };
    });

    const total = quiz.questoes.length;
    const pontosGanhos = calcularPontos(acertos, total);

    // Atualiza pontos e nível do usuário
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const novoTotal = user.totalPoints + pontosGanhos;
    const novoNivel = calcularNivel(novoTotal);

    await prisma.user.update({
      where: { id: req.userId },
      data: { totalPoints: novoTotal, level: novoNivel }
    });

    // Salva o resultado no histórico
    await prisma.resultado.create({
      data: {
        usuarioId: req.userId,
        quizId: Number(req.params.id),
        acertos,
        total,
        pontos: pontosGanhos
      }
    });

    res.json({
      acertos,
      total,
      percentual: `${Math.round((acertos / total) * 100)}%`,
      pontosGanhos,
      totalPoints: novoTotal,
      level: novoNivel,
      subioDeNivel: novoNivel > user.level,
      resultado
    });
  } catch (error) {
    next(error);
  }
};

// Funções auxiliares
const calcularPontos = (acertos, total) => {
  const percentual = acertos / total;
  if (percentual === 1)   return 50;
  if (percentual >= 0.7)  return 30;
  if (percentual >= 0.5)  return 15;
  return 5;
};

const calcularNivel = (pontos) => {
  if (pontos >= 1000) return 5;
  if (pontos >= 500)  return 4;
  if (pontos >= 200)  return 3;
  if (pontos >= 50)   return 2;
  return 1;
};
