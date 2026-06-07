const prisma = require('../utils/prisma');
const { nomeDoNivel } = require('../utils/levels');

exports.getRanking = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' }, // Admins não aparecem no ranking
      orderBy: { totalPoints: 'desc' },
      select: { id: true, name: true, username: true, profileImage: true, totalPoints: true, level: true },
      take: 100
    });

    const ranking = users.map((user, index) => ({
      position: index + 1,
      ...user,
      levelNome: nomeDoNivel(user.level),
    }));

    res.json(ranking);
  } catch (error) { next(error); }
};
