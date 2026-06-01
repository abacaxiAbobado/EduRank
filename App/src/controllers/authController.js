const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password)
      return res.status(400).json({ error: 'Nome, usuário e senha são obrigatórios.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres.' });

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser)
      return res.status(400).json({ error: 'Nome de usuário já cadastrado.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, username, password: hashedPassword }
    });

    res.status(201).json({
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
      token: generateToken(user.id, user.role)
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user)
      return res.status(401).json({ error: 'Credenciais inválidas.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: 'Credenciais inválidas.' });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        totalPoints: user.totalPoints,
        level: user.level,
        role: user.role
      },
      token: generateToken(user.id, user.role)
    });
  } catch (error) {
    next(error);
  }
};