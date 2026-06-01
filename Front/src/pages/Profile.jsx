import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import { calcularProgresso } from '../utils/levelCalculator';
import api from '../services/api';

const LEVELS = [0, 50, 200, 500, 1000, Infinity];

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const pct = user ? calcularProgresso(user.totalPoints, user.level) : 0;
  const next = user ? LEVELS[user.level] : 50;

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  function abrirEdicao() {
    setForm({ name: user?.name || '', username: user?.username || '', password: '' });
    setEditando(true);
    setMsg(''); setErro('');
  }

  async function salvar(e) {
    e.preventDefault();
    setLoading(true); setErro(''); setMsg('');
    try {
      const payload = {};
      if (form.name && form.name !== user.name) payload.name = form.name;
      if (form.username && form.username !== user.username) payload.username = form.username;
      if (form.password) payload.password = form.password;

      if (Object.keys(payload).length === 0) {
        setErro('Nenhuma alteração detectada.'); setLoading(false); return;
      }

      await api.put('/users/me', payload);
      await refreshUser();
      setMsg('Perfil atualizado com sucesso!');
      setEditando(false);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  }

  const input = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' };
  const label = { fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>Perfil 👤</h1>
        </div>

        <div style={{ maxWidth: 520 }}>
          {msg  && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', fontSize: '0.88rem' }}>{msg}</div>}
          {erro && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: 'rgba(247,106,106,0.1)', border: '1px solid rgba(247,106,106,0.3)', color: 'var(--danger)', fontSize: '0.88rem' }}>{erro}</div>}

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
                <div style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 2 }}>@{user?.username}</div>
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

          {/* ── FORMULÁRIO DE EDIÇÃO ── */}
          {editando ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 16, padding: 28, marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>Editar perfil</h2>
              <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label style={label}>Nome</label><input style={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><label style={label}>Username</label><input style={input} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
                <div><label style={label}>Nova senha <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>(deixe em branco para não alterar)</span></label><input style={input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••" /></div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: 12, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button type="button" onClick={() => setEditando(false)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button onClick={abrirEdicao} style={{
              width: '100%', padding: 13, background: 'transparent',
              border: '1px solid var(--accent)', borderRadius: 10,
              color: 'var(--accent)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
              marginBottom: 12,
            }}>
              Editar perfil
            </button>
          )}

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