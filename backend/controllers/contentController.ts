import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { prisma } from '../db/prismaClient.js';
import { parseAndConvertUrls } from '../utils/sanitizer.js';

export async function getContents(req: AuthenticatedRequest, res: Response) {
  try {
    const contents = await prisma.educationalContent.findMany({
      include: {
        author: true
      }
    });
    
    // Map educational contents and parse their text to make links clickable and escape malicious payloads
    const parsedContents = contents.map(article => {
      const isAuthorAdmin = article.author && article.author.role === 'ADMIN';

      return {
        id: article.id,
        title: article.title,
        htmlContent: parseAndConvertUrls(article.content),
        rawContent: article.content, // Keep original for loading inside editor
        category: article.category,
        tags: article.tags,
        authorName: isAuthorAdmin ? 'Institucional' : (article.author ? article.author.name : 'Institucional'),
        authorId: isAuthorAdmin ? null : article.authorId,
        imageUrl: article.imageUrl,
        attachedFiles: article.attachedFiles as any,
        createdAt: article.createdAt.toISOString()
      };
    });

    res.json(parsedContents);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro técnico ao carregar artigos de estudo: ' + error.message });
  }
}

export async function createContent(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const { title, content, category, tags, imageUrl, attachedFiles } = req.body;

    if (!title || !content || !category) {
      res.status(400).json({ error: 'Campos em falta: Título, conteúdo e categoria são obrigatórios.' });
      return;
    }

    const newContent = await prisma.educationalContent.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()) : [],
        authorId: userId,
        imageUrl: imageUrl || null,
        attachedFiles: Array.isArray(attachedFiles) ? attachedFiles : []
      }
    });

    res.status(201).json({
      message: 'Conteúdo educacional publicado com sucesso!',
      contentId: newContent.id
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Falha do servidor ao salvar conteúdo educacional: ' + error.message });
  }
}

export async function editContent(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const { id } = req.params;
    const { title, content, category, tags, imageUrl, attachedFiles } = req.body;

    const article = await prisma.educationalContent.findUnique({
      where: { id }
    });

    if (!article) {
      res.status(404).json({ error: 'Conteúdo de estudo não localizado.' });
      return;
    }

    // Authorization checks
    if (article.authorId !== userId && !isAdmin) {
      res.status(403).json({ error: 'Permissão negada. Apenas autores ou administradores podem modificar este artigo.' });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (category) updateData.category = category.trim();
    
    if (tags && Array.isArray(tags)) {
      updateData.tags = tags.map((t: string) => t.trim());
    }
    
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    
    if (attachedFiles && Array.isArray(attachedFiles)) {
      updateData.attachedFiles = attachedFiles;
    }

    const updated = await prisma.educationalContent.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Artigo atualizado com sucesso!',
      contentId: updated.id
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro de servidor durante a edição do conteúdo: ' + error.message });
  }
}

export async function deleteContent(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const { id } = req.params;

    const article = await prisma.educationalContent.findUnique({
      where: { id }
    });

    if (!article) {
      res.status(404).json({ error: 'Conteúdo não localizado.' });
      return;
    }

    if (article.authorId !== userId && !isAdmin) {
      res.status(403).json({ error: 'Apenas o criador ou administradores podem excluir este conteúdo.' });
      return;
    }

    await prisma.educationalContent.delete({
      where: { id }
    });

    res.json({ message: 'Conteúdo de estudos apagado com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro técnico ao excluir artigo: ' + error.message });
  }
}
