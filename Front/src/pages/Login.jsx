import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login as loginService } from '../services/authService';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await loginService(form.username, form.password);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '2.4rem',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>EduRank</div>
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Aprenda. Responda. Evolua.</div>
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 36,
        }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: 24 }}>Entrar</h2>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 8, marginBottom: 16,
              background: 'rgba(247,106,106,0.1)', border: '1px solid rgba(247,106,106,0.3)',
              color: 'var(--danger)', fontSize: '0.88rem',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Nome de Usuário</label>
              <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Usuário" required
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 16px', color: 'var(--text)', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Senha</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" required
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 16px', color: 'var(--text)', fontSize: '0.95rem', outline: 'none' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: 14, background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 10, fontFamily: 'Syne, sans-serif',
              fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--muted)' }}>
            Não tem conta?{' '}
            <Link to="/register" style={{ color: 'var(--accent)' }}>Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
