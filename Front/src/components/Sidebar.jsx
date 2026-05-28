import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { path: '/dashboard', icon: '🏠', label: 'Início' },
  { path: '/content',   icon: '📚', label: 'Conteúdos' },
  { path: '/quiz',      icon: '🧠', label: 'Quizzes' },
  { path: '/ranking',   icon: '🏆', label: 'Ranking' },
  { path: '/profile',   icon: '👤', label: 'Perfil' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Monta a lista de navegação — admin vê um item extra
  const nav = user?.role === 'ADMIN'
    ? [...NAV, { path: '/admin', icon: '⚙️', label: 'Admin' }]
    : NAV;

  return (
    <aside style={{
      width: 240, minHeight: '100vh',
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '28px 16px',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
    }}>
      <div style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem',
        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        padding: '0 8px', marginBottom: 32,
      }}>EduRank</div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {nav.map((item) => (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 12px', borderRadius: 10, border: 'none',
            background: pathname === item.path ? 'rgba(124,106,247,0.15)' : 'transparent',
            color: pathname === item.path ? 'var(--accent)' : 'var(--muted)',
            fontSize: '0.93rem', fontWeight: 500, cursor: 'pointer',
            width: '100%', textAlign: 'left', transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: '1.1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#fff',
            flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent2)' }}>Nível {user?.level}</div>
          </div>
        </div>
        <button onClick={logout} style={{
          width: '100%', marginTop: 8, padding: 9,
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--muted)', fontSize: '0.85rem',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)'; }}
        >
          Sair
        </button>
      </div>
    </aside>
  );
}