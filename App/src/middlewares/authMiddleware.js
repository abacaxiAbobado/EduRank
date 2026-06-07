const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token não informado.' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    // Verifica suspensão em tempo real
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { suspended: true, suspendedReason: true, suspendedUntil: true }
    });

    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });

    if (user.suspended) {
      // Verifica se a suspensão já expirou
      if (user.suspendedUntil && new Date() > new Date(user.suspendedUntil)) {
        // Auto-expira a suspensão
        await prisma.user.update({
          where: { id: decoded.userId },
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

    next();
  } catch {
    res.status(401).json({ error: 'Token inválido.' });
  }
};
