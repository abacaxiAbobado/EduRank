const LEVELS = [0, 50, 200, 500, 1000, Infinity];

export function calcularNivel(pontos) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (pontos >= LEVELS[i]) return i + 1;
  }
  return 1;
}

export function calcularProgresso(pontos, nivel) {
  const cur = LEVELS[nivel - 1];
  const next = LEVELS[nivel];
  if (next === Infinity) return 100;
  return Math.min(100, Math.round(((pontos - cur) / (next - cur)) * 100));
}

export function proximoNivel(nivel) {
  return LEVELS[nivel] === Infinity ? null : LEVELS[nivel];
}
