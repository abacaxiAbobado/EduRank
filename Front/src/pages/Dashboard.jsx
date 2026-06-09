import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import { useSidebar } from '../hooks/useSidebar';
import ProgressBar from '../components/ProgressBar';
import { calcularProgresso, nomeDoNivel, proximoPts } from '../utils/levelCalculator';

export default function Dashboard() {
  const { user } = useAuth();
  const sidebar = useSidebar();
  const pct = user ? calcularProgresso(user.totalPoints, user.level) : 0;
  const next = user ? proximoPts(user.level) : null;

  return (
    <div style={{ display: 'flex' }}>
      <MobileHeader onOpen={sidebar.open} />
      <Sidebar isOpen={sidebar.isOpen} onClose={sidebar.close} />
      <main style={{ marginLeft: 'var(--sidebar-width, 240px)', flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Veja seu progresso e continue estudando
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Pontos totais', value: user?.totalPoints ?? '—', color: 'var(--accent)' },
            { label: 'Nível atual', value: nomeDoNivel(user?.level), color: 'var(--accent2)' },
            { label: 'Pode criar quizzes?', value: user?.level >= 3 ? 'Sim ✅' : `Não (${nomeDoNivel(user?.level)})`, color: 'var(--accent3)' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 2px' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Progresso de nível</span>
            <span style={{ background: 'rgba(124,106,247,0.2)', color: 'var(--accent)', padding: '4px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600 }}>
              {nomeDoNivel(user?.level)}
            </span>
          </div>
          <ProgressBar value={pct} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.78rem', color: 'var(--muted)' }}>
            <span>{user?.totalPoints} pts</span>
            <span>{next === null ? 'Nível máximo! 🏆' : `Próximo nível: ${next} pts`}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
