import { prisma } from '../db/prismaClient.js';
import { register, login } from '../controllers/authController.js';
import { createQuiz, editQuiz, submitQuizAnswers } from '../controllers/quizController.js';
import { suspendUser, unsuspendUser } from '../controllers/adminController.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { Response } from 'express';

// --- IN-MEMORY DATABASE STATE FOR TESTING ---
const dbStore = {
  users: [] as any[],
  quizzes: [] as any[],
  questions: [] as any[],
  submissions: [] as any[],
  userCorrectQuestions: [] as any[],
  adminLogs: [] as any[]
};

// --- HELPER TO RESET DB STATE ---
function resetDb() {
  dbStore.users = [];
  dbStore.quizzes = [];
  dbStore.questions = [];
  dbStore.submissions = [];
  dbStore.userCorrectQuestions = [];
  dbStore.adminLogs = [];
}

// --- PRISMA CLIENT MOCKING LAYER ---
function setupPrismaMock() {
  // --- USER MOCKS ---
  (prisma as any).user = {
    count: async () => dbStore.users.length,
    findUnique: async (args: any) => {
      const { email, id } = args.where;
      if (email) {
        return dbStore.users.find(u => u.email === email) || null;
      }
      if (id) {
        return dbStore.users.find(u => u.id === id) || null;
      }
      return null;
    },
    findMany: async (args: any) => {
      if (args && args.where && args.where.isSuspended !== undefined) {
        return dbStore.users.filter(u => u.isSuspended === args.where.isSuspended);
      }
      return dbStore.users;
    },
    create: async (args: any) => {
      const newId = args.data.id || `u-${Math.random().toString(36).substr(2, 9)}`;
      const newUser = {
        id: newId,
        points: 0,
        completedQuizzesCount: 0,
        isSuspended: false,
        suspensionReason: null,
        suspensionEndsAt: null,
        ...args.data
      };
      dbStore.users.push(newUser);
      return newUser;
    },
    update: async (args: any) => {
      const { id } = args.where;
      const index = dbStore.users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found in mock DB');
      dbStore.users[index] = { ...dbStore.users[index], ...args.data };
      return dbStore.users[index];
    }
  };

  // --- QUIZ & QUESTIONS MOCKS ---
  (prisma as any).quiz = {
    findMany: async (args: any) => {
      return dbStore.quizzes.map(q => ({
        ...q,
        questions: dbStore.questions.filter(qst => qst.quizId === q.id),
        author: dbStore.users.find(u => u.id === q.authorId)
      }));
    },
    findUnique: async (args: any) => {
      const { id } = args.where;
      const quiz = dbStore.quizzes.find(q => q.id === id);
      if (!quiz) return null;
      return {
        ...quiz,
        questions: dbStore.questions.filter(qst => qst.quizId === id),
        author: dbStore.users.find(u => u.id === quiz.authorId)
      };
    },
    create: async (args: any) => {
      const newId = args.data.id || `q-${Math.random().toString(36).substr(2, 9)}`;
      const { questions, ...quizData } = args.data;

      const newQuiz = {
        id: newId,
        createdAt: new Date(),
        ...quizData
      };
      dbStore.quizzes.push(newQuiz);

      // Handle nested questions creation if present
      if (questions && questions.create) {
        questions.create.forEach((q: any) => {
          dbStore.questions.push({
            id: q.id || `qst-${Math.random().toString(36).substr(2, 9)}`,
            quizId: newId,
            ...q
          });
        });
      }
      return newQuiz;
    },
    update: async (args: any) => {
      const { id } = args.where;
      const { questions, ...updateData } = args.data;
      const index = dbStore.quizzes.findIndex(q => q.id === id);
      if (index === -1) throw new Error('Quiz not found in mock DB');

      dbStore.quizzes[index] = { ...dbStore.quizzes[index], ...updateData };

      if (questions && questions.create) {
        // Mocking questions deletion + recreation
        dbStore.questions = dbStore.questions.filter(q => q.quizId !== id);
        questions.create.forEach((q: any) => {
          dbStore.questions.push({
            id: q.id || `qst-${Math.random().toString(36).substr(2, 9)}`,
            quizId: id,
            ...q
          });
        });
      }
      return dbStore.quizzes[index];
    },
    delete: async (args: any) => {
      const { id } = args.where;
      dbStore.quizzes = dbStore.quizzes.filter(q => q.id !== id);
      dbStore.questions = dbStore.questions.filter(q => q.quizId !== id);
      return { id };
    }
  };

  // --- QUESTIONS (Stand-alone removal) ---
  (prisma as any).question = {
    deleteMany: async (args: any) => {
      if (args && args.where && args.where.quizId) {
        dbStore.questions = dbStore.questions.filter(q => q.quizId !== args.where.quizId);
      }
    }
  };

  // --- SUBMISSIONS MOCKS ---
  (prisma as any).quizSubmission = {
    count: async (args: any) => {
      const { userId, quizId } = args.where;
      return dbStore.submissions.filter(s => s.userId === userId && s.quizId === quizId).length;
    },
    create: async (args: any) => {
      const newSub = {
        id: `sub-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        ...args.data
      };
      dbStore.submissions.push(newSub);
      return newSub;
    }
  };

  // --- USER CORRECT QUESTIONS MOCKS ---
  (prisma as any).userCorrectQuestion = {
    findMany: async (args: any) => {
      const { userId } = args.where;
      return dbStore.userCorrectQuestions.filter(cq => cq.userId === userId);
    },
    createMany: async (args: any) => {
      const data = args.data as any[];
      data.forEach(item => {
        const exists = dbStore.userCorrectQuestions.find(
          cq => cq.userId === item.userId && cq.questionId === item.questionId
        );
        if (!exists) {
          dbStore.userCorrectQuestions.push({
            id: `cq-${Math.random().toString(36).substr(2, 9)}`,
            answeredAt: new Date(),
            ...item
          });
        }
      });
      return { count: data.length };
    }
  };

  // --- ADMIN LOGS MOCKS ---
  (prisma as any).adminLog = {
    create: async (args: any) => {
      const newLog = {
        id: `log-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        ...args.data
      };
      dbStore.adminLogs.push(newLog);
      return newLog;
    },
    findMany: async () => {
      return [...dbStore.adminLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
  };
}

// --- EXPRESS RESPONSE MOCK GENERATOR ---
function createMockResponse() {
  const res: Partial<Response> = {};
  let statusCode = 200;
  let jsonPayload: any = null;

  res.status = (code: number) => {
    statusCode = code;
    return res as Response;
  };

  res.json = (data: any) => {
    jsonPayload = data;
    return res as Response;
  };

  return {
    res: res as Response,
    getStatus: () => statusCode,
    getJson: () => jsonPayload
  };
}

// --- TEST RUNNER ORCHESTRATION ---
async function runAllTests() {
  console.log('\n=========================================');
  console.log('🏁 INICIANDO AUDITORIA E TESTES AUTOMATIZADOS EDURANK');
  console.log('=========================================\n');

  setupPrismaMock();

  let totalTests = 0;
  let passedTests = 0;
  const failures: string[] = [];

  async function test(name: string, fn: () => Promise<void>) {
    totalTests++;
    try {
      resetDb();
      await fn();
      passedTests++;
      console.log(`✅ [PASS] ${name}`);
    } catch (error: any) {
      failures.push(`${name}: ${error.message}`);
      console.error(`❌ [FAIL] ${name}`);
      console.error(error);
    }
  }

  // ==========================================
  // GRUPO 1: AUTENTICAÇÃO
  // ==========================================
  await test('Autenticação - Cadastro de novo usuário com dados válidos', async () => {
    const { res, getStatus, getJson } = createMockResponse();
    const req = {
      body: { name: 'Lucas Rossi', email: 'lucas@edurank.com', password: 'password123' }
    } as unknown as AuthenticatedRequest;

    await register(req, res);

    if (getStatus() !== 201) throw new Error(`Status de retorno incorreto: ${getStatus()}`);
    const data = getJson();
    if (!data.user || data.user.name !== 'Lucas Rossi') throw new Error('Falha ao cadastrar usuário.');
    if (dbStore.users.length !== 1) throw new Error('Usuário não persistido no banco.');
    if (dbStore.users[0].id.startsWith('u-')) {
      // Requiitos: auto-geração por UUID
      // Since mock produces random ids or lets prisma generate, let's make sure it contains no 'u-admin' or 'u-user' legacy values
      if (['u-admin', 'u-user', 'u-prof', 'u-target'].includes(dbStore.users[0].id)) {
        throw new Error('Erro: O ID continuou sendo um ID manual e fixo do seed.');
      }
    }
  });

  await test('Autenticação - Cadastro com e-mail inválido deve falhar', async () => {
    const { res, getStatus, getJson } = createMockResponse();
    const req = {
      body: { name: 'Lucas', email: 'invalid-email', password: 'password123' }
    } as unknown as AuthenticatedRequest;

    await register(req, res);

    if (getStatus() !== 400) throw new Error('Deveria falhar com status 400.');
    const data = getJson();
    if (!data.error.includes('Formato de e-mail inválido')) throw new Error('Mensagem de erro inadequada.');
  });

  await test('Autenticação - Cadastro de e-mail já existente deve retornar erro', async () => {
    // Seed an existing user
    dbStore.users.push({
      id: 'existing-id',
      name: 'Maria',
      email: 'maria@edurank.com',
      passwordHash: 'hash',
      salt: 'salt',
      role: 'USER',
      points: 0,
      completedQuizzesCount: 0
    });

    const { res, getStatus, getJson } = createMockResponse();
    const req = {
      body: { name: 'Maria Outra', email: 'maria@edurank.com', password: 'password123' }
    } as unknown as AuthenticatedRequest;

    await register(req, res);

    if (getStatus() !== 400) throw new Error('Deveria falhar com e-mail duplicado.');
    if (!getJson().error.includes('endereço de e-mail já está em uso')) throw new Error('Mensagem inadequada.');
  });

  await test('Autenticação - Login de usuário válido com senha correta', async () => {
    // Create actual mock user
    const reqReg = {
      body: { name: 'Teste Login', email: 'teste@edurank.com', password: 'senhafirme123' }
    } as unknown as AuthenticatedRequest;
    const resReg = createMockResponse();
    await register(reqReg, resReg.res);

    const { res, getStatus, getJson } = createMockResponse();
    const reqLog = {
      body: { email: 'teste@edurank.com', password: 'senhafirme123' }
    } as unknown as AuthenticatedRequest;

    await login(reqLog, res);

    if (getStatus() !== 200) throw new Error('Login válido falhou.');
    const data = getJson();
    if (!data.token) throw new Error('Token não retornado no login.');
  });

  // ==========================================
  // GRUPO 2: QUIZZES
  // ==========================================
  await test('Quizzes - Cadastro de novo quiz (Autorizado)', async () => {
    const adminUser = await prisma.user.create({
      data: { name: 'Admin', email: 'admin@edu.com', passwordHash: 'h', salt: 's', role: 'ADMIN' }
    });

    const { res, getStatus, getJson } = createMockResponse();
    const req = {
      user: { userId: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      body: {
        title: 'Quiz de Teste',
        description: 'Descrição elegante do Quiz',
        category: 'História',
        questions: [
          {
            questionText: 'Qual a capital do Brasil?',
            options: ['Rio de Janeiro', 'Brasília', 'São Paulo', 'Salvador'],
            correctAnswerIndex: 1,
            explanation: 'Brasília foi inaugurada em 1960.'
          }
        ]
      }
    } as unknown as AuthenticatedRequest;

    await createQuiz(req, res);

    if (getStatus() !== 201) throw new Error(`Criação de quiz falhou com status ${getStatus()}`);
    if (dbStore.quizzes.length !== 1) throw new Error('Quiz não persistido no banco de dados.');
    if (dbStore.questions.length !== 1) throw new Error('Questões do quiz não foram criadas.');
  });

  await test('Quizzes - Edição de Quiz existente por criador (Autorizado)', async () => {
    const adminUser = await prisma.user.create({
      data: { name: 'Admin', email: 'admin@edu.com', passwordHash: 'h', salt: 's', role: 'ADMIN' }
    });

    const mockQuiz = await prisma.quiz.create({
      data: {
        title: 'Quiz Original',
        description: 'Desc',
        category: 'Geometria',
        authorId: adminUser.id
      }
    });

    const { res, getStatus } = createMockResponse();
    const req = {
      params: { id: mockQuiz.id },
      user: { userId: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      body: {
        title: 'Quiz Editado com Sucesso',
        category: 'Álgebra'
      }
    } as unknown as AuthenticatedRequest;

    await editQuiz(req, res);

    if (getStatus() !== 200) throw new Error('Edição permitida falhou no status.');
    const updated = dbStore.quizzes[0];
    if (updated.title !== 'Quiz Editado com Sucesso') throw new Error('Título do quiz não sofreu alteração.');
    if (updated.category !== 'Álgebra') throw new Error('Categoria do quiz não sofreu alteração.');
  });

  // ==========================================
  // GRUPO 3: SISTEMA DE XP E NÍVEIS
  // ==========================================
  await test('XP & Níveis - Primeiro acerto concede pontuação e acerto repetido não acumula', async () => {
    // 1. Create User
    const user = await prisma.user.create({
      data: { name: 'Gamer', email: 'game@edurank.com', passwordHash: 'h', salt: 's', role: 'USER' }
    });

    // 2. Create Quiz with 2 questions
    const testQuiz = await prisma.quiz.create({
      data: {
        title: 'Quiz XP',
        category: 'Prog',
        description: 'Quiz para testar pontos',
        authorId: user.id,
        questions: {
          create: [
            { questionText: 'Q1', options: ['A', 'B'], correctAnswerIndex: 0, explanation: 'ex' },
            { questionText: 'Q2', options: ['C', 'D'], correctAnswerIndex: 1, explanation: 'ex' }
          ]
        }
      }
    });

    const questions = dbStore.questions.filter(q => q.quizId === testQuiz.id);

    // SUBMISSÃO 1: Acerta ambas as questões (Primeiro Acerto)
    const { res: res1, getJson: getJson1 } = createMockResponse();
    const req1 = {
      params: { id: testQuiz.id },
      user: { userId: user.id, email: user.email, role: 'USER' },
      body: { answers: [0, 1] } // Ambas corretas
    } as unknown as AuthenticatedRequest;

    await submitQuizAnswers(req1, res1);

    const data1 = getJson1();
    // In Level 1 (Aprendiz), 10 points per question -> total 20 points
    if (data1.pointsEarned !== 20) throw new Error(`Deveria ganhar 20 pontos de XP, ganhou: ${data1.pointsEarned}`);
    if (data1.userProgress.points !== 20) throw new Error('Pontuação do progresso não confere.');

    // SUBMISSÃO 2: Acerta ambas repetidas vezes (Sem novos acertos)
    const { res: res2, getJson: getJson2 } = createMockResponse();
    const req2 = {
      params: { id: testQuiz.id },
      user: { userId: user.id, email: user.email, role: 'USER' },
      body: { answers: [0, 1] } // Ambas corretas novamente
    } as unknown as AuthenticatedRequest;

    // Simulate in update that user points are now 20
    user.points = 20;

    await submitQuizAnswers(req2, res2);

    const data2 = getJson2();
    if (data2.pointsEarned !== 0) throw new Error(`Não deveria ganhar pontos repetidos! Ganhou: ${data2.pointsEarned}`);
    if (data2.userProgress.points !== 20) throw new Error('Pontos do usuário alterados incorretamente.');
  });

  await test('XP & Níveis - Progressão de níveis com exatamente 5 quizzes completos', async () => {
    // Requirements: Level 1 (Aprendiz) -> 0-4 quizzes solved. Level 2 (Desbravador) -> 5-9 solved.
    // Each level requires exactly 5 solved quizzes (level transition at completedCount = 5)
    
    const user = await prisma.user.create({
      data: { name: 'Nivelador', email: 'nivel@edurank.com', passwordHash: 'h', salt: 's', role: 'USER' }
    });

    const quiz = await prisma.quiz.create({
      data: {
        title: 'Quiz Nível',
        category: 'Geral',
        description: 'Apoio',
        authorId: user.id,
        questions: {
          create: [{ questionText: 'Q', options: ['A', 'B'], correctAnswerIndex: 0 }]
        }
      }
    });

    // Solve 4 times first (represented by completing 4 distinct prior submissions simulation)
    // When completedCount reaches 4: Still 'Aprendiz'
    user.completedQuizzesCount = 4;
    user.points = 40;

    // 5th distinct completion submit
    const { res, getJson } = createMockResponse();
    const req = {
      params: { id: quiz.id },
      user: { userId: user.id, email: user.email, role: 'USER' },
      body: { answers: [0] } // Correct
    } as unknown as AuthenticatedRequest;

    await submitQuizAnswers(req, res);

    const data = getJson();
    // User completed count should increase to 5
    if (data.userProgress.completedQuizzesCount !== 5) throw new Error(`Quizzes completos incorreto: ${data.userProgress.completedQuizzesCount}`);
    // Level should advance to 'Desbravador'!
    if (data.userProgress.levelName !== 'Desbravador') throw new Error(`Nível esperado "Desbravador", obtido: "${data.userProgress.levelName}"`);
    
    // Now let's try progression with 10 quizzes: Completed count reaches 10 -> 'Mentor'
    const activeUser = dbStore.users.find(u => u.id === user.id);
    if (activeUser) {
      activeUser.completedQuizzesCount = 9;
    }
    
    const quizMentor = await prisma.quiz.create({
      data: {
        id: 'quiz-mentor-id',
        title: 'Quiz Mentor',
        category: 'Geral',
        description: 'Apoio',
        authorId: user.id,
        questions: {
          create: [{ questionText: 'Q2', options: ['A', 'B'], correctAnswerIndex: 0 }]
        }
      }
    });

    const { res: resMentor, getJson: getJsonMentor } = createMockResponse();
    const reqMentor = {
      params: { id: quizMentor.id },
      user: { userId: user.id, email: user.email, role: 'USER' },
      body: { answers: [0] }
    } as unknown as AuthenticatedRequest;

    await submitQuizAnswers(reqMentor, resMentor);
    const dataMentor = getJsonMentor();
    if (dataMentor.userProgress.completedQuizzesCount !== 10) throw new Error(`Contagem de quizzes incorreta: ${dataMentor.userProgress.completedQuizzesCount}`);
    if (dataMentor.userProgress.levelName !== 'Mentor') throw new Error(`Nível esperado "Mentor", obtido: "${dataMentor.userProgress.levelName}"`);
  });

  // ==========================================
  // GRUPO 4: ADMINISTRAÇÃO E LOGS
  // ==========================================
  await test('Administração - Suspensão e remoção de suspensão de usuário com registro de logs', async () => {
    const admin = await prisma.user.create({
      data: { id: 'admin-id', name: 'Adm', email: 'adm@edu.com', passwordHash: 'h', salt: 's', role: 'ADMIN' }
    });

    const standard = await prisma.user.create({
      data: { id: 'student-id', name: 'Estudante', email: 'comum@edu.com', passwordHash: 'h', salt: 's', role: 'USER' }
    });

    // 1. SUSPEND USER
    const { res: resSuspend, getJson: getJsonSuspend, getStatus: getStatusSuspend } = createMockResponse();
    const reqSuspend = {
      params: { id: standard.id },
      user: { userId: admin.id, email: admin.email, role: 'ADMIN' },
      body: { reason: 'Cola repetida no sistema', endsAt: new Date(Date.now() + 10000).toISOString() }
    } as unknown as AuthenticatedRequest;

    await suspendUser(reqSuspend, resSuspend);

    const suspendedUser = await prisma.user.findUnique({ where: { id: standard.id } });
    const initialLogCount = dbStore.adminLogs.length;
    if (getStatusSuspend() !== 200) throw new Error('Falha ao suspender usuário.');
    if (!suspendedUser || !suspendedUser.isSuspended) throw new Error('Usuário deveria estar marcado como suspenso.');
    if (suspendedUser.suspensionReason !== 'Cola repetida no sistema') throw new Error('Motivo da suspensão incorreto.');
    if (initialLogCount !== 1) throw new Error('Registro de log da suspensão ausente.');

    // 2. UNSUSPEND USER
    const { res: resUnsuspend, getStatus: getStatusUnsuspend } = createMockResponse();
    const reqUnsuspend = {
      params: { id: standard.id },
      user: { userId: admin.id, email: admin.email, role: 'ADMIN' }
    } as unknown as AuthenticatedRequest;

    await unsuspendUser(reqUnsuspend, resUnsuspend);

    const unsuspendedUser = await prisma.user.findUnique({ where: { id: standard.id } });
    const finalLogCount = dbStore.adminLogs.length;
    if (getStatusUnsuspend() !== 200) throw new Error('Falha ao reverter suspensão de usuário.');
    if (!unsuspendedUser || unsuspendedUser.isSuspended) throw new Error('Usuário deveria estar desmarcado de suspensão.');
    if (finalLogCount !== 2) throw new Error('Registro de log da liberação ausente.');
  });

  // ==========================================
  // FINAL RESULTS REPORTING
  // ==========================================
  console.log('\n=========================================');
  console.log('📊 RELATÓRIO DO STATUS DA VALIDAÇÃO:');
  console.log(`Testes Planejados: ${totalTests}`);
  console.log(`Testes Aprovados:  ${passedTests}`);
  console.log(`Testes Falhos:     ${failures.length}`);
  console.log('=========================================');

  if (failures.length > 0) {
    console.error('\n❌ RESUMO DAS FALHAS ENCONTRADAS:');
    failures.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  } else {
    console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO COBRINDO OS REQUISITOS DE NEGÓCIO!');
    console.log('Pronto para implantação segura em Produção.');
    process.exit(0);
  }
}

runAllTests().catch(e => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
