const prisma = require('../utils/prisma');
const { calcularNivel, calcularPontosPorAcertos, nomeDoNivel } = require('../utils/levels');
const { sanitizeString, isUrlSegura } = require('../utils/sanitize');

// ── HELPERS ───────────────────────────────────────────────────

function sanitizeQuizData(titulo, descricao, questoes) {
  const erros = [];
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0)
    erros.push('Título é obrigatório.');

  if (questoes && Array.isArray(questoes)) {
    for (const [i, q] of questoes.entries()) {
      if (!q.pergunta || typeof q.pergunta !== 'string')
        erros.push(`Questão ${i + 1}: pergunta inválida.`);
      if (!Array.isArray(q.alternativas) || q.alternativas.length < 2)
        erros.push(`Questão ${i + 1}: mínimo 2 alternativas.`);
      if (!q.respostaCorreta || !q.alternativas?.includes(q.respostaCorreta))
        erros.push(`Questão ${i + 1}: resposta correta deve ser uma das alternativas.`);
    }
  }

  return erros;
}

function formatarAutor(autor) {
  if (!autor || autor.role === 'ADMIN') return null;
  return { name: autor.name, level: autor.level };
}

// ── CONTROLLERS ───────────────────────────────────────────────

exports.getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      select: {
        id: true, titulo: true, descricao: true, createdAt: true,
        autor: { select: { name: true, level: true, role: true } },
        _count: { select: { questoes: true } }
      }
    });

    const result = quizzes.map(q => ({
      ...q,
      autor: formatarAutor(q.autor)
    }));

    res.json(result);
  } catch (error) { next(error); }
};

exports.getQuizById = async (req, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        autor: { select: { id: true, name: true, role: true } },
        questoes: {
          select: { id: true, pergunta: true, alternativas: true, explicacao: true }
          // respostaCorreta NÃO é enviada
        }
      }
    });

    if (!quiz) return res.status(404).json({ error: 'Quiz não encontrado.' });

    res.json({ ...quiz, autor: formatarAutor(quiz.autor), autorId: quiz.autorId });
  } catch (error) { next(error); }
};

exports.createQuiz = async (req, res, next) => {
  try {
    const { titulo, descricao, questoes } = req.body;

    if (!questoes || !Array.isArray(questoes) || questoes.length === 0)
      return res.status(400).json({ error: 'Ao menos uma questão é obrigatória.' });

    const erros = sanitizeQuizData(titulo, descricao, questoes);
    if (erros.length) return res.status(400).json({ error: erros[0] });

    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { level: true } });
    if (user.level < 3 && req.userRole !== 'ADMIN')
      return res.status(403).json({ error: 'Você precisa ser Mentor (nível 3) para criar quizzes.' });

    const quiz = await prisma.quiz.create({
      data: {
        titulo: sanitizeString(titulo.trim()),
        descricao: descricao ? sanitizeString(descricao.trim()) : null,
        autorId: req.userId,
        questoes: {
          create: questoes.map(q => ({
            pergunta: sanitizeString(q.pergunta.trim()),
            alternativas: q.alternativas.map(a => sanitizeString(a.trim())),
            respostaCorreta: sanitizeString(q.respostaCorreta.trim()),
            explicacao: q.explicacao ? sanitizeString(q.explicacao.trim()) : null,
          }))
        }
      },
      include: { questoes: true }
    });

    res.status(201).json(quiz);
  } catch (error) { next(error); }
};

exports.updateQuiz = async (req, res, next) => {
  try {
    const quizId = Number(req.params.id);
    const { titulo, descricao, questoes } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { autorId: true }
    });

    if (!quiz) return res.status(404).json({ error: 'Quiz não encontrado.' });

    // Apenas o autor ou um ADMIN pode editar
    if (quiz.autorId !== req.userId && req.userRole !== 'ADMIN')
      return res.status(403).json({ error: 'Sem permissão para editar este quiz.' });

    if (questoes) {
      const erros = sanitizeQuizData(titulo || 'ok', descricao, questoes);
      if (erros.length) return res.status(400).json({ error: erros[0] });
    }

    // Atualiza campos do quiz
    const dataUpdate = {};
    if (titulo) dataUpdate.titulo = sanitizeString(titulo.trim());
    if (descricao !== undefined) dataUpdate.descricao = descricao ? sanitizeString(descricao.trim()) : null;

    await prisma.quiz.update({ where: { id: quizId }, data: dataUpdate });

    // Se vieram questões, substitui todas (deleta as antigas e recria)
    if (questoes && Array.isArray(questoes)) {
      await prisma.acertoQuestao.deleteMany({ where: { questao: { quizId } } });
      await prisma.questao.deleteMany({ where: { quizId } });
      await prisma.questao.createMany({
        data: questoes.map(q => ({
          quizId,
          pergunta: sanitizeString(q.pergunta.trim()),
          alternativas: q.alternativas.map(a => sanitizeString(a.trim())),
          respostaCorreta: sanitizeString(q.respostaCorreta.trim()),
          explicacao: q.explicacao ? sanitizeString(q.explicacao.trim()) : null,
        }))
      });
    }

    const updated = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questoes: true, autor: { select: { name: true, role: true } } }
    });

    res.json(updated);
  } catch (error) { next(error); }
};

exports.responderQuiz = async (req, res, next) => {
  try {
    const { respostas } = req.body;
    const quizId = Number(req.params.id);

    if (!respostas || !Array.isArray(respostas) || respostas.length === 0)
      return res.status(400).json({ error: 'Respostas são obrigatórias.' });

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questoes: true }
    });

    if (!quiz) return res.status(404).json({ error: 'Quiz não encontrado.' });

    // Busca questões já acertadas por este usuário
    const jaAcertadas = await prisma.acertoQuestao.findMany({
      where: { usuarioId: req.userId, questao: { quizId } },
      select: { questaoId: true }
    });
    const idsJaAcertados = new Set(jaAcertadas.map(a => a.questaoId));

    // Corrige as respostas
    let acertosTotal = 0;
    let acertosNovos = 0;
    const novosAcertos = [];
    const resultado = quiz.questoes.map(questao => {
      const respostaUsuario = respostas.find(r => r.questaoId === questao.id);
      const acertou = respostaUsuario?.resposta === questao.respostaCorreta;
      const jaAcertou = idsJaAcertados.has(questao.id);
      const ganhaPontos = acertou && !jaAcertou;

      if (acertou) acertosTotal++;
      if (ganhaPontos) {
        acertosNovos++;
        novosAcertos.push(questao.id);
      }

      return {
        questaoId: questao.id,
        pergunta: questao.pergunta,
        respostaUsuario: respostaUsuario?.resposta || null,
        respostaCorreta: questao.respostaCorreta,
        explicacao: questao.explicacao || null,
        acertou,
        jaAcertouAntes: jaAcertou,
        ganhaPontos,
      };
    });

    // Busca usuário para calcular pontos e nível
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const pontosGanhos = calcularPontosPorAcertos(acertosNovos, user.level);
    const novoTotal = Math.min(1000, user.totalPoints + pontosGanhos);
    const novoNivel = calcularNivel(novoTotal);
    const subioDeNivel = novoNivel > user.level;

    // Persiste tudo em uma transação
    await prisma.$transaction([
      // Atualiza pontos e nível do usuário
      prisma.user.update({
        where: { id: req.userId },
        data: { totalPoints: novoTotal, level: novoNivel }
      }),
      // Registra novos acertos (ignora duplicatas)
      ...novosAcertos.map(questaoId =>
        prisma.acertoQuestao.upsert({
          where: { usuarioId_questaoId: { usuarioId: req.userId, questaoId } },
          create: { usuarioId: req.userId, questaoId },
          update: {}
        })
      ),
      // Registra resultado do quiz
      prisma.resultado.create({
        data: {
          usuarioId: req.userId,
          quizId,
          acertos: acertosTotal,
          total: quiz.questoes.length,
          pontos: pontosGanhos
        }
      })
    ]);

    res.json({
      acertos: acertosTotal,
      acertosNovos,
      total: quiz.questoes.length,
      percentual: `${Math.round((acertosTotal / quiz.questoes.length) * 100)}%`,
      pontosGanhos,
      totalPoints: novoTotal,
      level: novoNivel,
      levelNome: nomeDoNivel(novoNivel),
      subioDeNivel,
      resultado,
    });
  } catch (error) { next(error); }
};
