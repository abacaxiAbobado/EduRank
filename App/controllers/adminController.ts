import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { prisma } from '../db/prismaClient.js';

export async function getAllUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await prisma.user.findMany();
    const usersList = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      points: u.points,
      isSuspended: u.isSuspended,
      suspensionReason: u.suspensionReason,
      suspensionEndsAt: u.suspensionEndsAt ? u.suspensionEndsAt.toISOString() : null,
      completedQuizzesCount: u.completedQuizzesCount
    }));

    res.json(usersList);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro de sistema ao recuperar usuários do Edurank: ' + error.message });
  }
}

export async function suspendUser(req: AuthenticatedRequest, res: Response) {
  try {
    const adminId = req.user?.userId;
    const adminEmail = req.user?.email || 'admin@edurank.com';
    const { id: userIdToSuspend } = req.params;
    const { reason, endsAt } = req.body;

    if (!adminId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    if (adminId === userIdToSuspend) {
      res.status(400).json({ error: 'Erro de operação. Você não pode suspender a si mesmo.' });
      return;
    }

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({ error: 'O motivo da suspensão é de preenchimento obrigatório.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdToSuspend }
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não localizado no sistema.' });
      return;
    }

    // Assign suspension state
    const suspensionEndsAtDate = endsAt ? new Date(endsAt) : null;

    const updatedUser = await prisma.user.update({
      where: { id: userIdToSuspend },
      data: {
        isSuspended: true,
        suspensionReason: reason.trim(),
        suspensionEndsAt: suspensionEndsAtDate
      }
    });

    // Log administrative action
    await prisma.adminLog.create({
      data: {
        action: 'USER_SUSPENSION',
        details: `Usuário '${user.name}' (${user.email}) suspenso por: "${reason.trim()}". Prazo final da suspensão: ${endsAt ? new Date(endsAt).toLocaleDateString('pt-BR') : 'Permanente'}`,
        adminId: adminId,
        adminEmail
      }
    });

    res.json({
      message: `O acesso do usuário ${user.name} foi suspenso com sucesso.`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        isSuspended: updatedUser.isSuspended,
        suspensionReason: updatedUser.suspensionReason,
        suspensionEndsAt: updatedUser.suspensionEndsAt ? updatedUser.suspensionEndsAt.toISOString() : null
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Falha durante o processamento da suspensão de usuário: ' + error.message });
  }
}

export async function unsuspendUser(req: AuthenticatedRequest, res: Response) {
  try {
    const adminId = req.user?.userId;
    const adminEmail = req.user?.email || 'admin@edurank.com';
    const { id: userIdToUnsuspend } = req.params;

    if (!adminId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdToUnsuspend }
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não localizado.' });
      return;
    }

    await prisma.user.update({
      where: { id: userIdToUnsuspend },
      data: {
        isSuspended: false,
        suspensionReason: null,
        suspensionEndsAt: null
      }
    });

    await prisma.adminLog.create({
      data: {
        action: 'USER_REINSTATEMENT',
        details: `Suspensão do usuário '${user.name}' (${user.email}) foi removida administrativamente.`,
        adminId: adminId,
        adminEmail
      }
    });

    res.json({
      message: `A suspensão do usuário ${user.name} foi revogada com sucesso.`,
      user: {
        id: user.id,
        name: user.name,
        isSuspended: false
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro técnico ao restabelecer acesso de usuário: ' + error.message });
  }
}

export async function getAdminLogs(req: AuthenticatedRequest, res: Response) {
  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao examinar registros de auditoria administrativa: ' + error.message });
  }
}
