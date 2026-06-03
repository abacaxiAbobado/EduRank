import { PrismaClient } from '@prisma/client';
import { hashPassword, generateSalt } from '../utils/crypto.js';

export const prisma = new PrismaClient();

export async function seedDatabase() {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('Production mode detected. Automatic seeding database disabled.');
      return;
    }

    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('Database already has data. Skipping auto-seeding.');
      return;
    }

    console.log('Database is empty. Seeding default EduRank data...');

    // Generate credentials
    const adminSalt = generateSalt();
    const adminHash = hashPassword('admin123', adminSalt);

    const userSalt = generateSalt();
    const userHash = hashPassword('comum123', userSalt);

    const profSalt = generateSalt();
    const profHash = hashPassword('professor123', profSalt);

    const targetSalt = generateSalt();
    const targetHash = hashPassword('edurank123', targetSalt);

    // Create Users
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador Geral',
        email: 'admin@edurank.com',
        passwordHash: adminHash,
        salt: adminSalt,
        role: 'ADMIN',
        points: 0,
        avatar: null,
        completedQuizzesCount: 0,
        isSuspended: false,
        suspensionReason: null
      }
    });

    const studentUser = await prisma.user.create({
      data: {
        name: 'João Estudante',
        email: 'comum@edurank.com',
        passwordHash: userHash,
        salt: userSalt,
        role: 'USER',
        points: 150,
        avatar: null,
        completedQuizzesCount: 3,
        isSuspended: false,
        suspensionReason: null
      }
    });

    const profUser = await prisma.user.create({
      data: {
        name: 'Prof. Carlos Silva',
        email: 'professor@edurank.com',
        passwordHash: profHash,
        salt: profSalt,
        role: 'USER',
        points: 50,
        avatar: null,
        completedQuizzesCount: 1,
        isSuspended: false,
        suspensionReason: null
      }
    });

    const targetUser = await prisma.user.create({
      data: {
        name: 'Usuário Teste',
        email: 'emaildomarea@gmail.com',
        passwordHash: targetHash,
        salt: targetSalt,
        role: 'USER',
        points: 0,
        avatar: null,
        completedQuizzesCount: 0,
        isSuspended: false,
        suspensionReason: null
      }
    });

    // Create Quizzes and Questions
    const htmlQuiz = await prisma.quiz.create({
      data: {
        id: 'q-html-css',
        title: 'Desbravando HTML e CSS Básico',
        description: 'Teste seus conhecimentos em estruturas semânticas, seletores e estilização moderna.',
        category: 'Programação',
        imageUrl: null,
        authorId: adminUser.id,
        questions: {
          create: [
            {
              id: 'q-html-1',
              questionText: 'Qual tag HTML5 é a mais indicada para envolver a navegação principal de um site?',
              options: ['<navigation>', '<nav>', '<menu>', '<header_nav>'],
              correctAnswerIndex: 1,
              explanation: 'A tag <nav> é um elemento semântico do HTML5 destinado para definir blocos de links de navegação principal.'
            },
            {
              id: 'q-html-2',
              questionText: 'No CSS, qual propriedade é utilizada para alinhar itens flexíveis ao longo do eixo principal?',
              options: ['align-items', 'justify-content', 'align-content', 'text-align'],
              correctAnswerIndex: 1,
              explanation: 'justify-content alinha componentes flexíveis ao longo do eixo primário (main axis).'
            },
            {
              id: 'q-html-3',
              questionText: 'O que faz a classe utility do Tailwind CSS "mx-auto"?',
              options: ['Define margem vertical automática', 'Alinha o texto ao centro', 'Define margens horizontais automáticas', 'Cria espaçamento interno automático'],
              correctAnswerIndex: 2,
              explanation: 'A propriedade mx-auto define as margens esquerda e direita (horizontal axis) como automáticas.'
            },
            {
              id: 'q-html-4',
              questionText: 'Qual propriedade define o modelo de caixa de uma tag para incluir paddings e borders no tamanho global?',
              options: ['box-sizing: border-box', 'box-sizing: content-box', 'box-width', 'box-model'],
              correctAnswerIndex: 0,
              explanation: 'box-sizing: border-box faz com que as dimensões totais de largura e altura englobem o preenchimento e a borda.'
            },
            {
              id: 'q-html-5',
              questionText: 'Em CSS Grid, qual comando cria um grid com três colunas de dimensões iguais configuradas de forma flexível?',
              options: ['grid-template-columns: 1fr 1fr 1fr', 'grid-template-columns: repeat(3, 1fr)', 'Ambas as opções estão corretas', 'Nenhuma das alternativas'],
              correctAnswerIndex: 2,
              explanation: 'Ambos os seletores grid-template-columns criam de maneira perfeita 3 colunas elásticas de frações correspondentes.'
            }
          ]
        }
      }
    });

    const jsQuiz = await prisma.quiz.create({
      data: {
        id: 'q-js-async',
        title: 'Dominando JavaScript Assíncrono',
        description: 'Aprofunde-se em Promises, Event Loop, Callbacks e a sintaxe moderna de async/await.',
        category: 'Programação',
        imageUrl: null,
        authorId: profUser.id,
        questions: {
          create: [
            {
              id: 'q-js-1',
              questionText: 'Qual é o status de uma Promise logo após ser instanciada no JavaScript?',
              options: ['fulfilled', 'rejected', 'pending', 'settled'],
              correctAnswerIndex: 2,
              explanation: 'Quando criada, uma Promise inicia no estado "pending" (pendente) até ser resolvida ou rejeitada.'
            },
            {
              id: 'q-js-2',
              questionText: 'Como capturar exceções geradas dentro de blocos async/await no JavaScript?',
              options: ['Usando blocos catch() encadeados', 'Utilizando a instrução try-catch estrutural', 'Usando verify()', 'O JavaScript ignora erros assíncronos'],
              correctAnswerIndex: 1,
              explanation: 'Com async/await, capturamos exceções e erros de execução encapsulando as operações em um bloco try-catch.'
            },
            {
              id: 'q-js-3',
              questionText: 'O que faz o método Promise.all()?',
              options: ['Executa apenas a primeira Promise concluída', 'Executa um conjunto em paralelo e resolve quando todas vencerem', 'Aguarda infinitamente', 'Cancela todas as promises pendentes'],
              correctAnswerIndex: 1,
              explanation: 'Promise.all retorna uma única Promise que resolve quando todas as Promises no iterável de entrada forem resolvidas com sucesso.'
            },
            {
              id: 'q-js-4',
              questionText: 'Qual fila de execução do Event Loop tem maior prioridade: a de Microtasks ou a de Macrotasks?',
              options: ['Macrotasks', 'Microtasks', 'Ambas possuem prioridades idênticas', 'Varia conforme o navegador'],
              correctAnswerIndex: 1,
              explanation: 'As Microtasks (como Promises resolvidos) possuem maior precedência de loop e rodam antes de Macrotasks (como setTimeout).'
            },
            {
              id: 'q-js-5',
              questionText: 'A palavra-chave "await" pode ser inserida em qualquer lugar no código JS síncrono?',
              options: ['Sim, em qualquer nível do arquivo', 'Apenas em escopos de funções declaradas com "async"', 'Apenas dentro de loops do tipo for-in', 'Apenas se importada de pacotes externos'],
              correctAnswerIndex: 1,
              explanation: 'Por padrão, o await exige que a função externa seja decorada utilizando a instrução async.'
            }
          ]
        }
      }
    });

    const sciQuiz = await prisma.quiz.create({
      data: {
        id: 'q-science',
        title: 'Ecologia e Meio Ambiente',
        description: 'Descubra seu potencial resolvendo questões sobre biomas terrestres, sustentabilidade e cadeias alimentares.',
        category: 'Ciências Naturais',
        imageUrl: null,
        authorId: adminUser.id,
        questions: {
          create: [
            {
              id: 'q-sci-1',
              questionText: 'Qual bioma brasileiro é considerado a savana brasileira e possui vegetação adaptada a secas periódicas?',
              options: ['Mata Atlântica', 'Cerrado', 'Pampas', 'Caatinga'],
              correctAnswerIndex: 1,
              explanation: 'O Cerrado é reconhecido mundialmente como a savana de maior biodiversidade e possui cascas grossas e raízes profundas.'
            },
            {
              id: 'q-sci-2',
              questionText: 'Na pirâmide trófica de energia, qual nível absorve a maior quantidade de energia disponível no ecossistema?',
              options: ['Consumidores primários', 'Produtores (plantas/algas)', 'Consumidores secundários', 'Decompositores'],
              correctAnswerIndex: 1,
              explanation: 'Os produtores estão na base da cadeia alimentar e absorvem energia diretamente da luz solar através da fotossíntese.'
            },
            {
              id: 'q-sci-3',
              questionText: 'O acúmulo progressivo de poluentes não biodegradáveis ao longo da cadeia alimentar é denominado:',
              options: ['Eutrofização', 'Sucessão Ecológica', 'Magnificação trófica', 'Bioestabilidade'],
              correctAnswerIndex: 2,
              explanation: 'A magnificação trófica ocorre quando poluentes insolúveis acumulam-se em maior escala nos níveis mais altos da pirâmide.'
            },
            {
              id: 'q-sci-4',
              questionText: 'Que gás da atmosfera é o principal responsável pelo efeito estufa natural benéfico que retém calor no planeta?',
              options: ['Gás Metano (CH4)', 'Dióxido de Carbono (CO2)', 'Vapor de Água (H2O)', 'Ozônio (O3)'],
              correctAnswerIndex: 1,
              explanation: 'Embora o vapor d\'água também contribua, o CO2 gerado por respiração e vulcanismo é o pilar estufa.'
            },
            {
              id: 'q-sci-5',
              questionText: 'O processamento no qual vegetação campestre é repousada e o solo recupera seus nutrientes naturais de cultivo denomina-se:',
              options: ['Lixiviação', 'Pousio', 'Erosão assistida', 'Calagem química'],
              correctAnswerIndex: 1,
              explanation: 'O pousio é a prática de interromper as atividades agrícolas para restaurar a fertilidade orgânica e preservar recursos hídricos.'
            }
          ]
        }
      }
    });

    // Create Contents
    await prisma.educationalContent.create({
      data: {
        id: 'c-async',
        title: 'Guia de Chamadas Assíncronas no JavaScript',
        category: 'Programação',
        tags: ['JavaScript', 'WebDev', 'Promises'],
        authorId: adminUser.id,
        imageUrl: null,
        content: `O desenvolvimento JavaScript é fundamentalmente assíncrono. Entender como Promises resolvem fluxos é crucial para criar softwares rápidos e que não travam as interfaces dos usuários.\n\n### Os Três Estados Fundamentais de uma Promise\n1. **Pending (Pendente)**: A operação assíncrona ainda está rodando.\n2. **Fulfilled (Realizada)**: Sucesso! Recebemos nossos dados.\n3. **Rejected (Rejeitada)**: Ocorreu um erro na requisição.\n\nPara acompanhar mais detalhes, visite a documentação oficial na Mozilla Developer Network: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise.\n\n### Utilizando Async/Await como Sintaxe Amigável\nA sintaxe modernizada de async e await evita o chamado "callback hell". Veja como fica simples consumir uma API:\n\n\`\`\`javascript\nasync function buscarDadosDoUsuario(id) {\n  try {\n    const resposta = await fetch(\`https://api.edurank.com/users/\${id}\`);\n    if (!resposta.ok) throw new Error("Erro de conexão");\n    const dados = await resposta.json();\n    return dados;\n  } catch (error) {\n    console.error(\"Falha ao recuperar informações:\", error.message);\n  }\n}\n\`\`\`\n\nAcesse nosso repositório no GitHub para exemplos práticos adicionais: https://github.com/microsoft/TypeScript-Handbook/ para referenciar a digitação precisa do seu código TypeScript moderno.`,
        attachedFiles: [
          { name: 'JavaScript Async CheatSheet.pdf', url: 'https://developer.mozilla.org/pt-BR/docs/Web/JavaScript' }
        ]
      }
    });

    await prisma.educationalContent.create({
      data: {
        id: 'c-web-semantics',
        title: 'HTML5 Semântico e Suas Vantagens Competitivas',
        category: 'Programação',
        tags: ['HTML', 'SEO', 'Acessibilidade'],
        authorId: profUser.id,
        imageUrl: null,
        content: `Entender os elementos semânticos do HTML5 vai muito além de ter um código bonito de ler. Ele oferece vantagens pesadas para ranqueamento (SEO) e mecanismos de acessibilidade assistiva (leitores de tela para deficientes visuais).\n\nUtilize tags estruturadas como \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<section>\`, \`<aside>\` e \`<footer>\` em vez do tradicional padrão ultrapassado de divs aninhadas infinitamente.\n\nPara validar seu HTML semântico com os padrões do W3C markup validator, utilize o link direto de serviço oficial: https://validator.w3.org/ que audita as marcações em busca de erros estruturais.`,
        attachedFiles: []
      }
    });

    // Create Submissions & Question Progress
    await prisma.quizSubmission.create({
      data: {
        id: 'sub-1',
        quizId: 'q-html-css',
        userId: studentUser.id,
        answers: [1, 1, 2, 0, 2],
        score: 100,
        pointsEarned: 50,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    });

    await prisma.quizSubmission.create({
      data: {
        id: 'sub-2',
        quizId: 'q-js-async',
        userId: studentUser.id,
        answers: [2, 1, 1, 1, 0],
        score: 80,
        pointsEarned: 100,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    });

    await prisma.userCorrectQuestion.createMany({
      data: [
        { userId: studentUser.id, questionId: 'q-html-1' },
         { userId: studentUser.id, questionId: 'q-html-2' },
         { userId: studentUser.id, questionId: 'q-html-3' },
         { userId: studentUser.id, questionId: 'q-html-4' },
         { userId: studentUser.id, questionId: 'q-html-5' },
         { userId: studentUser.id, questionId: 'q-js-1' },
         { userId: studentUser.id, questionId: 'q-js-2' },
         { userId: studentUser.id, questionId: 'q-js-3' },
         { userId: studentUser.id, questionId: 'q-js-4' }
      ]
    });

    // Create Logs
    await prisma.adminLog.create({
      data: {
        id: 'l-seed',
        action: 'DATABASE_INITIALIZATION',
        details: 'Base de dados EduRank semeada automaticamente no PostgreSQL via Prisma no primeiro start.',
        adminId: adminUser.id,
        adminEmail: 'admin@edurank.com'
      }
    });

    console.log('Database seeded successfully.');
  } catch (error: any) {
    console.error('Error during database checking/seeding:', error.message);
  }
}
