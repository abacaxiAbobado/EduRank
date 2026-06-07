import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import Avatar from './Avatar';

const NAV = [
  { path: '/dashboard', icon: '🏠', label: 'Início' },
  { path: '/content',   icon: '📚', label: 'Conteúdos' },
  { path: '/quiz',      icon: '🧠', label: 'Quizzes' },
  { path: '/ranking',   icon: '🏆', label: 'Ranking' },
  { path: '/profile',   icon: '👤', label: 'Perfil' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
        fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem',
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
        {/* Botão de tema */}
        <button onClick={toggleTheme} style={{
          width: '100%', marginBottom: 10, padding: '9px 12px',
          background: 'transparent', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--muted)', fontSize: '0.85rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          transition: 'all 0.15s',
        }}>
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
        </button>

        {/* Info do usuário */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8 }}>
          <Avatar user={user} size={36} />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent2)' }}>
              {user?.levelNome || `Nível ${user?.level}`}
            </div>
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
