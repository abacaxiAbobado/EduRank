import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { prisma } from '../db/prismaClient.js';
import { getProgressionStats } from '../utils/levels.js';

export async function getQuizzes(req: AuthenticatedRequest, res: Response) {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        author: true,
        questions: true
      }
    });

    const result = quizzes.map(quiz => {
      const showAuthor = quiz.author && quiz.author.role !== 'ADMIN';
      
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        imageUrl: quiz.imageUrl,
        authorName: showAuthor ? quiz.author.name : 'Institucional',
        authorId: showAuthor ? quiz.authorId : null,
        questionsCount: quiz.questions.length,
        createdAt: quiz.createdAt.toISOString()
      };
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro técnico ao carregar lista de quizzes: ' + error.message });
  }
}

export async function getQuizById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        author: true,
        questions: true
      }
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz não localizado.' });
      return;
    }

    const showAuthor = quiz.author && quiz.author.role !== 'ADMIN';

    // To prevent cheating, we strictly hide correctAnswerIndex and explanation!
    res.json({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      imageUrl: quiz.imageUrl,
      authorName: showAuthor ? quiz.author.name : 'Institucional',
      authorId: showAuthor ? quiz.authorId : null,
      questions: quiz.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        options: q.options
        // correctAnswerIndex and explanation NOT sent before submission!
      })),
      createdAt: quiz.createdAt.toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao examinar detalhes do quiz: ' + error.message });
  }
}

export async function createQuiz(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const { title, description, category, imageUrl, questions } = req.body;

    if (!title || !category || !questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ error: 'Campos essenciais em falta: Título, categoria e questões são obrigatórios.' });
      return;
    }

    const formattedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2 || q.correctAnswerIndex === undefined) {
        res.status(400).json({ error: `Estrutura de questão número ${i + 1} inválida. Requer opções e resposta correta.` });
        return;
      }
      formattedQuestions.push({
        questionText: q.questionText.trim(),
        options: q.options.map((o: string) => o.trim()),
        correctAnswerIndex: parseInt(q.correctAnswerIndex, 10),
        explanation: q.explanation ? q.explanation.trim() : null
      });
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : '',
        category: category.trim(),
        imageUrl: imageUrl || null,
        authorId: userId,
        questions: {
          create: formattedQuestions
        }
      }
    });

    res.status(201).json({
      message: 'Quiz adicionado com sucesso ao Edurank!',
      quizId: newQuiz.id
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Falha do servidor ao cadastrar quiz: ' + error.message });
  }
}

export async function editQuiz(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const { id } = req.params;
    const { title, description, category, imageUrl, questions } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz não localizado.' });
      return;
    }

    if (quiz.authorId !== userId && !isAdmin) {
      res.status(403).json({ error: 'Permissão negada. Apenas o criador ou administradores podem editar este quiz.' });
      return;
    }

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category) updateData.category = category.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    if (questions && Array.isArray(questions)) {
      if (questions.length === 0) {
        res.status(400).json({ error: 'O quiz não pode ficar vazio. Adicione pelo menos uma questão.' });
        return;
      }

      // First delete all existing questions to update them
      await prisma.question.deleteMany({
        where: { quizId: id }
      });

      updateData.questions = {
        create: questions.map((q, i) => {
          if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2 || q.correctAnswerIndex === undefined) {
            throw new Error(`A questão número ${i + 1} está com estrutura em falta.`);
          }
          return {
            id: q.id || undefined,
            questionText: q.questionText.trim(),
            options: q.options.map((o: string) => o.trim()),
            correctAnswerIndex: parseInt(q.correctAnswerIndex, 10),
            explanation: q.explanation ? q.explanation.trim() : null
          };
        })
      };
    }

    await prisma.quiz.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Quiz atualizado com sucesso!',
      quizId: quiz.id
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro técnico na edição do quiz: ' + error.message });
  }
}

export async function deleteQuiz(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const { id } = req.params;

    const quiz = await prisma.quiz.findUnique({
      where: { id }
    });

    if (!quiz) {
      res.status(404).json({ error: 'Quiz não localizado.' });
      return;
    }

    if (quiz.authorId !== userId && !isAdmin) {
      res.status(403).json({ error: 'Apenas autores ou administradores podem deletar este quiz.' });
      return;
    }

    await prisma.quiz.delete({
      where: { id }
    });

    res.json({ message: 'Quiz deletado do sistema com sucesso.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro técnico ao deletar quiz: ' + error.message });
  }
}

export async function submitQuizAnswers(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado.' });
      return;
    }

    const { id: quizId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ error: 'Formato de respostas incorreto. Deve ser um array contendo os índices escolhidos.' });
      return;
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });
    if (!quiz) {
      res.status(404).json({ error: 'Quiz não localizado.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      res.status(404).json({ error: 'Usuário não localizado.' });
      return;
    }

    const totalQuestions = quiz.questions.length;
    let correctCount = 0;
    let scorePercentage = 0;

    const answersBreakdown: any[] = [];
    let newlyAnsweredCorrectIds: string[] = [];

    // Load user's already correctly answered questions to avoid double counting points
    const userCorrectQuestions = await prisma.userCorrectQuestion.findMany({
      where: { userId }
    });
    const alreadyCorrectSet = new Set(userCorrectQuestions.map(cq => cq.questionId));

    // Evaluate answers
    quiz.questions.forEach((question, idx) => {
      const selectedIndex = answers[idx]; // Could be undefined or number
      const isCorrect = selectedIndex !== undefined && selectedIndex === question.correctAnswerIndex;
      
      if (isCorrect) {
        correctCount += 1;
      }

      const alreadyCorrect = alreadyCorrectSet.has(question.id);

      if (isCorrect && !alreadyCorrect) {
        newlyAnsweredCorrectIds.push(question.id);
      }

      // Return details ONLY upon submission to protect correct answers
      answersBreakdown.push({
        questionId: question.id,
        questionText: question.questionText,
        options: question.options,
        selectedIndex,
        correctAnswerIndex: question.correctAnswerIndex,
        isCorrect,
        alreadyCorrect,
        explanation: question.explanation
      });
    });

    scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    const statsBefore = getProgressionStats(user.completedQuizzesCount);
    let totalPointsEarned = 0;
    
    if (statsBefore.levelName !== 'Mestre' && newlyAnsweredCorrectIds.length > 0) {
      totalPointsEarned = newlyAnsweredCorrectIds.length * statsBefore.pointsPerQuestion;
      
      // Save newly corrected entries
      await prisma.userCorrectQuestion.createMany({
        data: newlyAnsweredCorrectIds.map(qId => ({
          userId,
          questionId: qId
        })),
        skipDuplicates: true
      });
    }

    // Verify if this is the first submission for this quiz by this user to raise quiz completion count
    const priorSubmissionsCount = await prisma.quizSubmission.count({
      where: { userId, quizId }
    });
    const hasPriorSubmission = priorSubmissionsCount > 0;
    let quizCompletedNotification = false;

    let updatedCompletedQuizzesCount = user.completedQuizzesCount;
    if (!hasPriorSubmission) {
      updatedCompletedQuizzesCount += 1;
      quizCompletedNotification = true;
    }

    const updatedPoints = Math.min(1000, user.points + totalPointsEarned);

    // Update user stats
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: updatedPoints,
        completedQuizzesCount: updatedCompletedQuizzesCount
      }
    });

    // Register active submission
    await prisma.quizSubmission.create({
      data: {
        quizId,
        userId,
        answers,
        score: scorePercentage,
        pointsEarned: totalPointsEarned
      }
    });
    
    const statsAfter = getProgressionStats(updatedUser.completedQuizzesCount);

    res.json({
      message: 'Respostas processadas com sucesso!',
      score: scorePercentage,
      correctCount,
      totalQuestions,
      pointsEarned: totalPointsEarned,
      quizCompletedNowForFirstTime: quizCompletedNotification,
      userProgress: {
        points: updatedPoints,
        completedQuizzesCount: updatedCompletedQuizzesCount,
        levelName: statsAfter.levelName,
        progression: statsAfter
      },
      answersBreakdown
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro técnico ao processar submissão do quiz: ' + error.message });
  }
}
