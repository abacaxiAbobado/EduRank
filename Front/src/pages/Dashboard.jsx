import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import { calcularProgresso } from '../utils/levelCalculator';

const LEVELS = [0, 50, 200, 500, 1000, Infinity];

export default function Dashboard() {
  const { user } = useAuth();
  const pct = user ? calcularProgresso(user.totalPoints, user.level) : 0;
  const next = user ? LEVELS[user.level] : 50;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Veja seu progresso e continue estudando
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Pontos totais', value: user?.totalPoints ?? '—', icon: '⭐', color: 'var(--accent)' },
            { label: 'Nível atual', value: user?.level ?? '—', icon: '🎯', color: 'var(--accent2)' },
            { label: 'Pode criar quizzes?', value: user?.level >= 3 ? 'Sim ✅' : `Não (nív. ${user?.level}/3)`, icon: '✏️', color: 'var(--accent3)' },
          ].map((s) => (
            <div key={s.label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 22, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, margin: '6px 0 2px' }}>{s.value}</div>
              <div style={{ position: 'absolute', top: 18, right: 18, fontSize: '1.6rem', opacity: 0.3 }}>{s.icon}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Progresso de nível</span>
            <span style={{
              background: 'rgba(124,106,247,0.2)', color: 'var(--accent)',
              padding: '4px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
            }}>Nível {user?.level}</span>
          </div>
          <ProgressBar value={pct} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.78rem', color: 'var(--muted)' }}>
            <span>{user?.totalPoints} pts</span>
            <span>{next === Infinity ? 'Nível máximo!' : `Próximo nível: ${next} pts`}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
