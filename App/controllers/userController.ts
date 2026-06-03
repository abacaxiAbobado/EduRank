import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { prisma } from '../db/prismaClient.js';
import { getLevelName, getProgressionStats } from '../utils/levels.js';

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não localizado.' });
      return;
    }

    const levelName = getLevelName(user.completedQuizzesCount);
    const progression = getProgressionStats(user.completedQuizzesCount);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: Math.min(1000, user.points), // Cap at 1000
      completedQuizzesCount: user.completedQuizzesCount,
      avatar: user.avatar,
      levelName,
      progression
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro no servidor ao carregar perfil: ' + error.message });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const { name, avatar, removeAvatar } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não localizado.' });
      return;
    }

    let updatedName = user.name;
    let updatedAvatar = user.avatar;

    // Name modification
    if (name) {
      if (name.trim().length === 0) {
        res.status(400).json({ error: 'O nome não pode ser deixado em branco.' });
        return;
      }
      updatedName = name.trim();
    }

    // Avatar modification
    if (removeAvatar === true) {
      updatedAvatar = null;
    } else if (avatar) {
      // Base64 format check: expect "data:image/png;base64,...", "data:image/jpeg;base64,...", "data:image/webp;base64,..."
      const matches = avatar.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (!matches) {
        res.status(400).json({ error: 'Formato de imagem inválido. Use um formato Base64 correto.' });
        return;
      }

      const mimeType = matches[1].toLowerCase();
      const base64Data = matches[2];

      // Validate expansion type
      if (!['png', 'jpeg', 'jpg', 'webp'].includes(mimeType)) {
        res.status(400).json({ error: 'Formato de arquivo não suportado. Utilize apenas JPG, PNG ou WEBP.' });
        return;
      }

      // Check approximate byte size
      const bufferSize = Buffer.from(base64Data, 'base64').length;
      const MAX_SIZE = 2 * 1024 * 1024; // 2 Megabytes
      if (bufferSize > MAX_SIZE) {
        res.status(400).json({ error: 'Tamanho de imagem excedente. O limite máximo é de 2MB.' });
        return;
      }

      // Save valid avatar
      updatedAvatar = avatar;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: updatedName,
        avatar: updatedAvatar
      }
    });

    res.json({
      message: 'Configurações de perfil guardadas com sucesso!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        points: Math.min(1000, updatedUser.points),
        avatar: updatedUser.avatar,
        completedQuizzesCount: updatedUser.completedQuizzesCount,
        levelName: getLevelName(updatedUser.completedQuizzesCount)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Falha técnica ao salvar alterações cadastrais: ' + error.message });
  }
}

export async function getRanking(req: AuthenticatedRequest, res: Response) {
  try {
    // Exclude suspended members from public rankings
    const activeUsers = await prisma.user.findMany({
      where: { isSuspended: false }
    });

    // Dynamic map to compute levels and points correctly
    const leaderboard = activeUsers.map(user => {
      return {
        id: user.id,
        name: user.name,
        points: Math.min(1000, user.points),
        avatar: user.avatar,
        completedQuizzesCount: user.completedQuizzesCount,
        levelName: getLevelName(user.completedQuizzesCount),
        role: user.role
      };
    });

    // Ordenação decrescente de pontos. Caso haja empate, ordena por quizzes finalizados.
    leaderboard.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.completedQuizzesCount - a.completedQuizzesCount;
    });

    res.json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro técnico no carregamento de rankings: ' + error.message });
  }
}
