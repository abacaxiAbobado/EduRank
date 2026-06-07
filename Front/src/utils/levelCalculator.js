// Sincronizado com App/src/utils/levels.js
export const LEVELS = [
  { level: 1, nome: 'Aprendiz',    minPts: 0,   maxPts: 249  },
  { level: 2, nome: 'Desbravador', minPts: 250,  maxPts: 499  },
  { level: 3, nome: 'Mentor',      minPts: 500,  maxPts: 749  },
  { level: 4, nome: 'Mestre',      minPts: 750,  maxPts: 1000 },
];

export function calcularNivel(pontos) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (pontos >= LEVELS[i].minPts) return LEVELS[i].level;
  }
  return 1;
}

export function nomeDoNivel(level) {
  return LEVELS.find(l => l.level === level)?.nome ?? 'Aprendiz';
}

export function calcularProgresso(pontos, nivel) {
  const cur = LEVELS[nivel - 1];
  const next = LEVELS[nivel];
  if (!next) return 100;
  return Math.min(100, Math.round(((pontos - cur.minPts) / (next.minPts - cur.minPts)) * 100));
}

export function proximoPts(nivel) {
  return LEVELS[nivel]?.minPts ?? null;
}
