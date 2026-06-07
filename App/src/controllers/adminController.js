const prisma = require('../utils/prisma');
const { sanitizeString } = require('../utils/sanitize');

// ── USUÁRIOS ──────────────────────────────────────────────────

exports.getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, username: true, totalPoints: true,
        level: true, role: true, createdAt: true,
        suspended: true, suspendedReason: true, suspendedUntil: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) { next(error); }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role))
      return res.status(400).json({ error: 'Role inválido. Use "USER" ou "ADMIN".' });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, username: true, role: true }
    });

    await prisma.adminLog.create({
      data: { adminId: req.userId, acao: 'UPDATE_ROLE', alvo: req.params.id, detalhes: `Role alterado para ${role}` }
    });

    res.json({ message: `Usuário agora é ${role}.`, user });
  } catch (error) { next(error); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.userId)
      return res.status(400).json({ error: 'Você não pode deletar sua própria conta.' });

    await prisma.acertoQuestao.deleteMany({ where: { usuarioId: req.params.id } });
    await prisma.resultado.deleteMany({ where: { usuarioId: req.params.id } });
    await prisma.user.delete({ where: { id: req.params.id } });

    await prisma.adminLog.create({
      data: { adminId: req.userId, acao: 'DELETE_USER', alvo: req.params.id }
    });

    res.json({ message: 'Usuário deletado.' });
  } catch (error) { next(error); }
};

exports.suspendUser = async (req, res, next) => {
  try {
    const { motivo, ate } = req.body; // ate: ISO date string ou null (permanente)

    if (req.params.id === req.userId)
      return res.status(400).json({ error: 'Você não pode suspender sua própria conta.' });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        suspended: true,
        suspendedReason: motivo ? sanitizeString(motivo.trim()) : 'Sem motivo informado.',
        suspendedUntil: ate ? new Date(ate) : null,
      },
      select: { id: true, name: true, suspended: true, suspendedReason: true, suspendedUntil: true }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.userId,
        acao: 'SUSPEND_USER',
        alvo: req.params.id,
        detalhes: `Motivo: ${motivo || 'N/A'} | Até: ${ate || 'permanente'}`
      }
    });

    res.json({ message: 'Usuário suspenso.', user });
  } catch (error) { next(error); }
};

exports.unsuspendUser = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { suspended: false, suspendedReason: null, suspendedUntil: null },
      select: { id: true, name: true, suspended: true }
    });

    await prisma.adminLog.create({
      data: { adminId: req.userId, acao: 'UNSUSPEND_USER', alvo: req.params.id }
    });

    res.json({ message: 'Suspensão removida.', user });
  } catch (error) { next(error); }
};

// ── CONTEÚDOS ─────────────────────────────────────────────────

exports.createConteudo = async (req, res, next) => {
  try {
    const { titulo, descricao, corpo } = req.body;
    if (!titulo || !corpo) return res.status(400).json({ error: 'Título e corpo são obrigatórios.' });

    const conteudo = await prisma.conteudo.create({
      data: {
        titulo: sanitizeString(titulo.trim()),
        descricao: descricao ? sanitizeString(descricao.trim()) : null,
        corpo: corpo.trim()
      }
    });
    res.status(201).json(conteudo);
  } catch (error) { next(error); }
};

exports.updateConteudo = async (req, res, next) => {
  try {
    const { titulo, descricao, corpo } = req.body;
    const conteudo = await prisma.conteudo.update({
      where: { id: Number(req.params.id) },
      data: {
        titulo: titulo ? sanitizeString(titulo.trim()) : undefined,
        descricao: descricao !== undefined ? (descricao ? sanitizeString(descricao.trim()) : null) : undefined,
        corpo: corpo ? corpo.trim() : undefined
      }
    });
    res.json(conteudo);
  } catch (error) { next(error); }
};

exports.deleteConteudo = async (req, res, next) => {
  try {
    await prisma.conteudo.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Conteúdo deletado.' });
  } catch (error) { next(error); }
};

// ── QUIZZES ───────────────────────────────────────────────────

exports.deleteQuiz = async (req, res, next) => {
  try {
    const quizId = Number(req.params.id);
    await prisma.acertoQuestao.deleteMany({ where: { questao: { quizId } } });
    await prisma.resultado.deleteMany({ where: { quizId } });
    await prisma.questao.deleteMany({ where: { quizId } });
    await prisma.quiz.delete({ where: { id: quizId } });

    await prisma.adminLog.create({
      data: { adminId: req.userId, acao: 'DELETE_QUIZ', alvo: String(quizId) }
    });

    res.json({ message: 'Quiz deletado.' });
  } catch (error) { next(error); }
};

// ── LOGS ──────────────────────────────────────────────────────

exports.getLogs = async (req, res, next) => {
  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { admin: { select: { name: true, username: true } } }
    });
    res.json(logs);
  } catch (error) { next(error); }
};
