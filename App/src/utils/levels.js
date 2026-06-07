// Sistema de Níveis EduRank
// Nível 1: Aprendiz    → 0–249 pts    (50 pts/quiz)
// Nível 2: Desbravador → 250–499 pts  (100 pts/quiz)
// Nível 3: Mentor      → 500–749 pts  (150 pts/quiz)
// Nível 4: Mestre      → 750–1000 pts (nível máximo)

const LEVELS = [
  { level: 1, nome: 'Aprendiz',    minPts: 0,   maxPts: 249,  ptsPorQuiz: 50  },
  { level: 2, nome: 'Desbravador', minPts: 250,  maxPts: 499,  ptsPorQuiz: 100 },
  { level: 3, nome: 'Mentor',      minPts: 500,  maxPts: 749,  ptsPorQuiz: 150 },
  { level: 4, nome: 'Mestre',      minPts: 750,  maxPts: 1000, ptsPorQuiz: null },
];

/**
 * Retorna o número do nível baseado nos pontos totais.
 */
function calcularNivel(pontos) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (pontos >= LEVELS[i].minPts) return LEVELS[i].level;
  }
  return 1;
}

/**
 * Retorna o nome do nível baseado no número do nível.
 */
function nomeDoNivel(level) {
  const found = LEVELS.find(l => l.level === level);
  return found ? found.nome : 'Aprendiz';
}

/**
 * Calcula os pontos ganhos em um quiz com base no nível atual do usuário,
 * considerando apenas questões acertadas pela primeira vez.
 */
function calcularPontosPorAcertos(acertosNovos, nivelAtual) {
  const levelData = LEVELS.find(l => l.level === nivelAtual) || LEVELS[0];
  const ptsPorQuestao = levelData.ptsPorQuiz / 5; // distribuído por questão (base: 5 questões)
  return Math.round(acertosNovos * ptsPorQuestao);
}

/**
 * Retorna dados completos do nível atual e próximo.
 */
function infoNivel(pontos) {
  const nivel = calcularNivel(pontos);
  const current = LEVELS[nivel - 1];
  const next = LEVELS[nivel] || null;

  const progress = next
    ? Math.min(100, Math.round(((pontos - current.minPts) / (next.minPts - current.minPts)) * 100))
    : 100;

  return {
    nivel,
    nome: current.nome,
    minPts: current.minPts,
    maxPts: current.maxPts,
    proximoNivel: next ? next.nivel : null,
    proximoNome: next ? next.nome : null,
    proximoPts: next ? next.minPts : null,
    progresso: progress,
  };
}

module.exports = { calcularNivel, nomeDoNivel, calcularPontosPorAcertos, infoNivel, LEVELS };
