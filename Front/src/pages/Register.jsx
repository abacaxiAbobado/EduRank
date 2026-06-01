import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { register as registerService } from '../services/authService';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', password: '' }); // ✅ email → username
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await registerService(form.name, form.username, form.password); // ✅ form.email → form.username
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  const field = (key, label, type, placeholder) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder} required minLength={key === 'password' ? 6 : undefined}
        style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 16px', color: 'var(--text)', fontSize: '0.95rem', outline: 'none' }}
      />
    </div>
  );

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

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 36 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: 24 }}>Criar conta</h2>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 8, marginBottom: 16,
              background: 'rgba(247,106,106,0.1)', border: '1px solid rgba(247,106,106,0.3)',
              color: 'var(--danger)', fontSize: '0.88rem',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {field('name', 'Nome', 'text', 'Seu nome completo')}
            {field('username', 'Nome de usuário', 'text', 'ex: joao_silva')} {/* ✅ email → username */}
            {field('password', 'Senha', 'password', 'Mínimo 6 caracteres')}
            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: 14, background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 10, fontFamily: 'Syne, sans-serif',
              fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--muted)' }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: 'var(--accent)' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}