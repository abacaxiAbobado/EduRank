const prisma = require('../utils/prisma');

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
