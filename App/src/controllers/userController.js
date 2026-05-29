const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        username: true,
        profileImage: true,
        totalPoints: true,
        level: true,
        role: true,
        createdAt: true
      }
    });

    if (!user)
      return res.status(404).json({ error: 'Usuário não encontrado.' });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, username, password } = req.body;
    const data = {};

    if (name) data.name = name;
    if (username) {
      const exists = await prisma.user.findFirst({ where: { username, NOT: { id: req.userId } } });
      if (exists) return res.status(400).json({ error: 'Username já está em uso.' });
      data.username = username;
    }
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, name: true, username: true, profileImage: true, totalPoints: true, level: true, role: true, createdAt: true }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};