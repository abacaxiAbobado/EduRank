const prisma = require('../utils/prisma');

// Listar todos os usuários
exports.getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, username: true,  // ✅ email → username
        totalPoints: true, level: true, role: true, createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) { next(error); }
};

// Promover usuário a ADMIN ou rebaixar para USER
exports.updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role))
      return res.status(400).json({ error: 'Role inválido. Use "USER" ou "ADMIN".' });

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json({ message: `Usuário agora é ${role}.`, user });
  } catch (error) { next(error); }
};

// Deletar usuário
exports.deleteUser = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Usuário deletado.' });
  } catch (error) { next(error); }
};

// Criar conteúdo
exports.createConteudo = async (req, res, next) => {
  try {
    const { titulo, descricao, corpo } = req.body;
    const conteudo = await prisma.conteudo.create({
      data: { titulo, descricao, corpo }
    });
    res.status(201).json(conteudo);
  } catch (error) { next(error); }
};

// Editar conteúdo
exports.updateConteudo = async (req, res, next) => {
  try {
    const { titulo, descricao, corpo } = req.body;
    const conteudo = await prisma.conteudo.update({
      where: { id: Number(req.params.id) },
      data: { titulo, descricao, corpo }
    });
    res.json(conteudo);
  } catch (error) { next(error); }
};

// Deletar conteúdo
exports.deleteConteudo = async (req, res, next) => {
  try {
    await prisma.conteudo.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Conteúdo deletado.' });
  } catch (error) { next(error); }
};

// Deletar quiz
exports.deleteQuiz = async (req, res, next) => {
  try {
    // deleta questões e resultados antes por causa das relações
    await prisma.questao.deleteMany({ where: { quizId: Number(req.params.id) } });
    await prisma.resultado.deleteMany({ where: { quizId: Number(req.params.id) } });
    await prisma.quiz.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Quiz deletado.' });
  } catch (error) { next(error); }
};