import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/crypto.js';
import { prisma } from '../db/prismaClient.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Token de autenticação não fornecido.' });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Token inválido ou expirado. Faça login novamente.' });
      return;
    }

    // Active DB check for suspension
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      res.status(401).json({ error: 'Usuário não encontrado.' });
      return;
    }

    // Suspension enforcement
    if (user.isSuspended) {
      // Check if there's a suspension end date and if it's already expired
      if (user.suspensionEndsAt) {
        const expirationDate = new Date(user.suspensionEndsAt);
        if (expirationDate.getTime() < Date.now()) {
          // Suspension expired! Let's unsuspend the user automatically!
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isSuspended: false,
              suspensionReason: null,
              suspensionEndsAt: null
            }
          });
        } else {
          res.status(403).json({
            suspended: true,
            error: 'Sua conta está temporariamente suspensa por conduta imprópria.',
            reason: user.suspensionReason || 'Sem motivo especificado',
            endsAt: user.suspensionEndsAt.toISOString()
          });
          return;
        }
      } else {
        // Permanent suspension
        res.status(403).json({
          suspended: true,
          error: 'Sua conta está permanentemente suspensa do Edurank por violação dos termos.',
          reason: user.suspensionReason || 'Sem motivo especificado',
          endsAt: 'Permanente'
        });
        return;
      }
    }

    req.user = payload;
    next();
  } catch (error: any) {
    res.status(500).json({ error: 'Erro de validação de token: ' + error.message });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Acesso negado. Requer privilégios de Administrador.' });
    return;
  }
  next();
}
