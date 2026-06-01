const prisma = require('../utils/prisma');

// Listar todos os conteúdos
exports.getConteudos = async (req, res, next) => {
  try {
    const conteudos = await prisma.conteudo.findMany({
      select: {
        id: true,
        titulo: true,
        descricao: true,
        createdAt: true
      }
    });

    res.json(conteudos);
  } catch (error) {
    next(error);
  }
};

// Buscar um conteúdo pelo id
exports.getConteudoById = async (req, res, next) => {
  try {
    const conteudo = await prisma.conteudo.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!conteudo)
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });

    res.json(conteudo);
  } catch (error) {
    next(error);
  }
};