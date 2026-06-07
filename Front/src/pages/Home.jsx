import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, padding: 32, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '3rem', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduRank</div>
      <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Aprenda. Responda. Evolua.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate('/login')} style={{ padding: '12px 28px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Entrar</button>
        <button onClick={() => navigate('/register')} style={{ padding: '12px 28px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Criar conta</button>
      </div>
    </div>
  );
}
