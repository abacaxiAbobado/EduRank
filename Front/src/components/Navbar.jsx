import { useAuth } from '../hooks/useAuth';

export default function Navbar({ title }) {
  const { user } = useAuth();
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 28,
    }}>
      <div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{user?.totalPoints} pts</span>
        <div style={{
          background: 'rgba(124,106,247,0.2)', color: 'var(--accent)',
          padding: '4px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
        }}>Nível {user?.level}</div>
      </div>
    </header>
  );
}
