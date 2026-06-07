import Avatar from './Avatar';
import { nomeDoNivel } from '../utils/levelCalculator';

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
      borderRadius: 14, padding: '14px 20px',
    }}>
      <div style={{
        fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem',
        width: 32, textAlign: 'center',
        color: isTop ? COLORS[index] : 'var(--muted)',
      }}>
        {isTop ? MEDALS[index] : `#${user.position}`}
      </div>
      <Avatar user={user} size={40} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
          {user.levelNome || nomeDoNivel(user.level)}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--accent2)' }}>
        {user.totalPoints} pts
      </div>
    </div>
  );
}
