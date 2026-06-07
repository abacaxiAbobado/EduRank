import { useNavigate } from 'react-router-dom';
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '5rem', fontWeight: 800, color: 'var(--muted)' }}>404</div>
      <p style={{ color: 'var(--muted)' }}>Página não encontrada.</p>
      <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, cursor: 'pointer' }}>Voltar ao início</button>
    </div>
  );
}
