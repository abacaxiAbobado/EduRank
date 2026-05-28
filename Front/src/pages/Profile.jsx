import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import { calcularProgresso } from '../utils/levelCalculator';

const LEVELS = [0, 50, 200, 500, 1000, Infinity];

export default function Profile() {
  const { user, logout } = useAuth();
  const pct = user ? calcularProgresso(user.totalPoints, user.level) : 0;
  const next = user ? LEVELS[user.level] : 50;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>Perfil 👤</h1>
        </div>

        <div style={{ maxWidth: 520 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#fff',
              }}>
                {user?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem' }}>{user?.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 2 }}>{user?.email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Pontos', value: user?.totalPoints },
                { label: 'Nível', value: user?.level },
                { label: 'Cargo', value: user?.role === 'ADMIN' ? '⚙️ Admin' : '🎓 Estudante' },
                { label: 'Membro desde', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '—' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 8 }}>
                <span>Progresso nível {user?.level}</span>
                <span>{pct}%</span>
              </div>
              <ProgressBar value={pct} />
              <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                {next === Infinity ? 'Nível máximo!' : `Faltam ${next - (user?.totalPoints || 0)} pts para o próximo nível`}
              </div>
            </div>
          </div>

          <button onClick={logout} style={{
            width: '100%', padding: 13, background: 'transparent',
            border: '1px solid var(--danger)', borderRadius: 10,
            color: 'var(--danger)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
          }}>
            Sair da conta
          </button>
        </div>
      </main>
    </div>
  );
}
