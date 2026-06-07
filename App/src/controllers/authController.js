const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password)
      return res.status(400).json({ error: 'Nome, usuário e senha são obrigatórios.' });

    if (typeof name !== 'string' || name.trim().length < 2)
      return res.status(400).json({ error: 'Nome deve ter ao menos 2 caracteres.' });

    if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(username.trim()))
      return res.status(400).json({ error: 'Username deve ter 3-30 caracteres e conter apenas letras, números e _.' });

    if (password.length < 6)
      return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres.' });

    const existingUser = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (existingUser)
      return res.status(400).json({ error: 'Nome de usuário já cadastrado.' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name: name.trim(), username: username.trim(), password: hashedPassword }
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

    const user = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (!user)
      return res.status(401).json({ error: 'Credenciais inválidas.' });

    // Verifica suspensão antes de validar senha
    if (user.suspended) {
      if (user.suspendedUntil && new Date() > new Date(user.suspendedUntil)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { suspended: false, suspendedReason: null, suspendedUntil: null }
        });
      } else {
        return res.status(403).json({
          error: 'Conta suspensa.',
          motivo: user.suspendedReason || 'Sem motivo informado.',
          ate: user.suspendedUntil || null,
          suspensa: true,
        });
      }
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: 'Credenciais inválidas.' });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        profileImage: user.profileImage,
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
