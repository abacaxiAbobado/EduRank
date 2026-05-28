const MEDALS = ['🥇', '🥈', '🥉'];
const COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];
const TOP_BG = ['rgba(255,215,0,0.04)', 'rgba(192,192,192,0.04)', 'rgba(205,127,50,0.04)'];

export default function RankingCard({ user, index }) {
  const isTop = index < 3;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      background: isTop ? TOP_BG[index] : 'var(--surface)',
      border: `1px solid ${isTop ? COLORS[index] : 'var(--border)'}`,
      borderRadius: 14, padding: '16px 20px',
    }}>
      <div style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem',
        width: 32, textAlign: 'center',
        color: isTop ? COLORS[index] : 'var(--muted)',
      }}>
        {isTop ? MEDALS[index] : `#${user.position}`}
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#fff', fontSize: '0.9rem',
      }}>
        {user.name?.[0]?.toUpperCase() || '?'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
      </div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--accent2)' }}>
        {user.totalPoints} pts
      </div>
    </div>
  );
}
