const prisma = require('../utils/prisma');

exports.getRanking = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { totalPoints: 'desc' },
      select: {
        id: true,
        name: true,
        profileImage: true,
        totalPoints: true
      },
      take: 100
    });

    const ranking = users.map((user, index) => ({
      position: index + 1,
      ...user
    }));

    res.json(ranking);
  } catch (error) {
    next(error);
  }
};
