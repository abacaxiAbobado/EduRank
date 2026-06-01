export const mockUser = {
  id: '1',
  name: 'João Silva',
  username: 'joaosilva',
  totalPoints: 340,
  level: 3,
  role: 'USER',
  createdAt: '2024-01-15T00:00:00.000Z',
};

export const mockRanking = [
  { id: '1', name: 'João Silva',  username: 'joaosilva',  totalPoints: 340, level: 3, role: 'USER' },
  { id: '2', name: 'Maria Souza', username: 'mariasouza', totalPoints: 280, level: 2, role: 'USER' },
  { id: '3', name: 'Carlos Lima', username: 'carloslima', totalPoints: 210, level: 2, role: 'USER' },
  { id: '4', name: 'Ana Paula',   username: 'anapaula',   totalPoints: 150, level: 1, role: 'USER' },
  { id: '5', name: 'Pedro Alves', username: 'pedroalves', totalPoints: 90,  level: 1, role: 'USER' },
  { id: '6', name: 'Admin Geral', username: 'admin',      totalPoints: 999, level: 5, role: 'ADMIN' },
];

export const mockConteudos = [
  { id: '1', titulo: 'Introdução ao JavaScript', descricao: 'Aprenda os fundamentos do JS', corpo: 'JavaScript é uma linguagem de programação criada em 1995...' },
  { id: '2', titulo: 'React para iniciantes',    descricao: 'Componentes, props e estado',  corpo: 'React é uma biblioteca para construção de interfaces...' },
  { id: '3', titulo: 'CSS Avançado',             descricao: 'Flexbox, Grid e animações',    corpo: 'O CSS moderno oferece ferramentas poderosas...' },
];

export const mockQuizzes = [
  {
    id: '1',
    titulo: 'Quiz de JavaScript',
    descricao: 'Teste seus conhecimentos em JS',
    _count: { questoes: 3 },
    autor: { name: 'Admin Geral' },
    questoes: [
      { id: 'q1', pergunta: 'O que é uma variável?', alternativas: ['Um tipo de dado', 'Um espaço na memória', 'Uma função', 'Um loop'], respostaCorreta: 'Um espaço na memória' },
      { id: 'q2', pergunta: 'Qual keyword declara constante?', alternativas: ['var', 'let', 'const', 'def'], respostaCorreta: 'const' },
      { id: 'q3', pergunta: 'O que faz o console.log?', alternativas: ['Salva dados', 'Exibe no console', 'Apaga variáveis', 'Cria funções'], respostaCorreta: 'Exibe no console' },
    ],
  },
  {
    id: '2',
    titulo: 'Quiz de React',
    descricao: 'Teste seus conhecimentos em React',
    _count: { questoes: 2 },
    autor: { name: 'Admin Geral' },
    questoes: [
      { id: 'q4', pergunta: 'O que é um componente?', alternativas: ['Um arquivo CSS', 'Um bloco reutilizável de UI', 'Um banco de dados', 'Uma rota'], respostaCorreta: 'Um bloco reutilizável de UI' },
      { id: 'q5', pergunta: 'Para que serve o useState?', alternativas: ['Fazer requisições', 'Gerenciar estado local', 'Criar rotas', 'Estilizar componentes'], respostaCorreta: 'Gerenciar estado local' },
    ],
  },
];