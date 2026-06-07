import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import ProgressBar from '../components/ProgressBar';
import Avatar from '../components/Avatar';
import { calcularProgresso, nomeDoNivel, proximoPts } from '../utils/levelCalculator';
import api from '../services/api';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const pct = user ? calcularProgresso(user.totalPoints, user.level) : 0;
  const nextPts = user ? proximoPts(user.level) : null;

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef(null);

  const s = {
    input: { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none' },
    label: { fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 },
  };

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
      if (Object.keys(payload).length === 0) { setErro('Nenhuma alteração detectada.'); setLoading(false); return; }

      await api.put('/users/me', payload);
      await refreshUser();
      setMsg('Perfil atualizado com sucesso!');
      setEditando(false);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao atualizar perfil.');
    } finally { setLoading(false); }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { setErro('Formato inválido. Use JPG, PNG ou WEBP.'); return; }
    if (file.size > 1.5 * 1024 * 1024) { setErro('Imagem muito grande. Máximo: 1.5MB.'); return; }

    setUploadingImg(true); setErro('');
    try {
      const base64 = await toBase64(file);
      await api.put('/users/me', { profileImage: base64 });
      await refreshUser();
      setMsg('Foto atualizada!');
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao atualizar foto.');
    } finally { setUploadingImg(false); }
  }

  async function removerFoto() {
    setUploadingImg(true);
    try {
      await api.put('/users/me', { profileImage: null });
      await refreshUser();
      setMsg('Foto removida.');
    } catch { setErro('Erro ao remover foto.'); }
    finally { setUploadingImg(false); }
  }

  function toBase64(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>Perfil 👤</h1>
        </div>

        <div style={{ maxWidth: 520 }}>
          {msg  && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)', fontSize: '0.88rem' }}>{msg}</div>}
          {erro && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', fontSize: '0.88rem' }}>{erro}</div>}

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 16 }}>
            {/* Avatar com opção de upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ position: 'relative' }}>
                <Avatar user={user} size={72} />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImg}
                  title="Trocar foto"
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--accent)', border: '2px solid var(--surface)',
                    color: '#fff', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {uploadingImg ? '…' : '✎'}
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageUpload} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem' }}>{user?.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 2 }}>@{user?.username}</div>
                {user?.profileImage && (
                  <button onClick={removerFoto} disabled={uploadingImg} style={{ marginTop: 6, background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>
                    Remover foto
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Pontos', value: user?.totalPoints },
                { label: 'Nível', value: nomeDoNivel(user?.level) },
                { label: 'Cargo', value: user?.role === 'ADMIN' ? '⚙️ Admin' : '🎓 Estudante' },
                { label: 'Membro desde', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '—' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 8 }}>
                <span>{nomeDoNivel(user?.level)}</span>
                <span>{pct}%</span>
              </div>
              <ProgressBar value={pct} />
              <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
                {nextPts === null ? 'Nível máximo!' : `Faltam ${nextPts - (user?.totalPoints || 0)} pts para o próximo nível`}
              </div>
            </div>
          </div>

          {editando ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 16, padding: 28, marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>Editar perfil</h2>
              <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label style={s.label}>Nome</label><input style={s.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><label style={s.label}>Username</label><input style={s.input} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
                <div>
                  <label style={s.label}>Nova senha <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>(deixe em branco para não alterar)</span></label>
                  <input style={s.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••" />
                </div>
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
            <button onClick={abrirEdicao} style={{ width: '100%', padding: 13, background: 'transparent', border: '1px solid var(--accent)', borderRadius: 10, color: 'var(--accent)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', marginBottom: 12 }}>
              Editar perfil
            </button>
          )}

          <button onClick={logout} style={{ width: '100%', padding: 13, background: 'transparent', border: '1px solid var(--danger)', borderRadius: 10, color: 'var(--danger)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
            Sair da conta
          </button>
        </div>
      </main>
    </div>
  );
}
