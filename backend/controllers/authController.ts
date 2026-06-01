import { Request, Response } from 'express';
import { prisma } from '../db/prismaClient.js';
import { generateSalt, hashPassword, generateToken } from '../utils/crypto.js';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    // Strict validation
    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: 'O nome é obrigatório.' });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Formato de e-mail inválido.' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'A senha deve possuir no mínimo 6 caracteres.' });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    // Check availability
    const exists = await prisma.user.findUnique({
      where: { email: emailLower }
    });
    if (exists) {
      res.status(400).json({ error: 'Este endereço de e-mail já está em uso.' });
      return;
    }

    // Hash credentials
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailLower,
        passwordHash,
        salt,
        role: 'USER',
        points: 0,
        avatar: null,
        completedQuizzesCount: 0,
        isSuspended: false,
        suspensionReason: null
      }
    });

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as 'ADMIN' | 'USER'
    });

    res.status(201).json({
      message: 'Cadastro efetuado com sucesso!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as 'ADMIN' | 'USER',
        points: newUser.points,
        avatar: newUser.avatar,
        completedQuizzesCount: newUser.completedQuizzesCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro no servidor ao registrar usuário: ' + error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Campos e-mail e senha são obrigatórios.' });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: emailLower }
    });
    if (!user) {
      res.status(400).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
      return;
    }

    // Verify hash
    const matchHash = hashPassword(password, user.salt);
    if (matchHash !== user.passwordHash) {
      res.status(400).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
      return;
    }

    // Suspension check
    if (user.isSuspended) {
      if (user.suspensionEndsAt) {
        const expirationDate = new Date(user.suspensionEndsAt);
        if (expirationDate.getTime() < Date.now()) {
          // Suspension expired! Let's unsuspend the user!
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
            error: 'Sua conta está suspensa temporariamente por conduta inadequada.',
            reason: user.suspensionReason || 'Sem motivo especificado',
            endsAt: user.suspensionEndsAt.toISOString()
          });
          return;
        }
      } else {
        res.status(403).json({
          suspended: true,
          error: 'Sua conta está permanentemente suspensa do Edurank.',
          reason: user.suspensionReason || 'Sem motivo especificado',
          endsAt: 'Permanente'
        });
        return;
      }
    }

    // Double check updated user profile state
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!freshUser) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const token = generateToken({
      userId: freshUser.id,
      email: freshUser.email,
      role: freshUser.role as 'ADMIN' | 'USER'
    });

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: freshUser.id,
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role as 'ADMIN' | 'USER',
        points: freshUser.points,
        avatar: freshUser.avatar,
        completedQuizzesCount: freshUser.completedQuizzesCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro no servidor ao autenticar usuário: ' + error.message });
  }
}
