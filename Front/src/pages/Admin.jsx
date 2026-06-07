import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { nomeDoNivel } from '../utils/levelCalculator';
import api from '../services/api';

const TAB = ['Conteúdos', 'Quizzes', 'Usuários', 'Logs'];

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [conteudos, setConteudos] = useState([]);
  const [novoConteudo, setNovoConteudo] = useState({ titulo: '', descricao: '', corpo: '' });
  const [editando, setEditando] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [logs, setLogs] = useState([]);
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [suspendModal, setSuspendModal] = useState(null); // { userId, name }
  const [suspendForm, setSuspendForm] = useState({ motivo: '', ate: '', permanente: false });

  const s = {
    card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 10 },
    input: { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none' },
    label: { fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 },
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN') { navigate('/dashboard'); return; }
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [c, q, u, l] = await Promise.all([
        api.get('/content').then(r => r.data),
        api.get('/quizzes').then(r => r.data),
        api.get('/admin/users').then(r => r.data),
        api.get('/admin/logs').then(r => r.data),
      ]);
      setConteudos(c); setQuizzes(q); setUsuarios(u); setLogs(l);
    } catch { feedback(false, 'Erro ao carregar dados.'); }
  }

  function feedback(ok, texto) {
    if (ok) { setMsg(texto); setErro(''); }
    else { setErro(texto); setMsg(''); }
    setTimeout(() => { setMsg(''); setErro(''); }, 3500);
  }

  // ── CONTEÚDOS ──────────────────────────────────────────
  async function criarConteudo(e) {
    e.preventDefault();
    try { await api.post('/admin/conteudos', novoConteudo); setNovoConteudo({ titulo: '', descricao: '', corpo: '' }); fetchAll(); feedback(true, 'Conteúdo criado!'); }
    catch { feedback(false, 'Erro ao criar conteúdo.'); }
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    try { await api.put(`/admin/conteudos/${editando.id}`, editando); setEditando(null); fetchAll(); feedback(true, 'Conteúdo atualizado!'); }
    catch { feedback(false, 'Erro ao atualizar.'); }
  }

  async function deletarConteudo(id) {
    if (!confirm('Deletar este conteúdo?')) return;
    try { await api.delete(`/admin/conteudos/${id}`); fetchAll(); feedback(true, 'Conteúdo deletado.'); }
    catch { feedback(false, 'Erro ao deletar.'); }
  }

  // ── QUIZZES ────────────────────────────────────────────
  async function deletarQuiz(id) {
    if (!confirm('Deletar este quiz?')) return;
    try { await api.delete(`/admin/quizzes/${id}`); fetchAll(); feedback(true, 'Quiz deletado.'); }
    catch { feedback(false, 'Erro ao deletar.'); }
  }

  // ── USUÁRIOS ───────────────────────────────────────────
  async function alterarRole(id, role) {
    try { await api.patch(`/admin/users/${id}/role`, { role }); fetchAll(); feedback(true, 'Role atualizado!'); }
    catch { feedback(false, 'Erro ao atualizar role.'); }
  }

  async function deletarUsuario(id) {
    if (!confirm('Deletar este usuário? Esta ação não pode ser desfeita.')) return;
    try { await api.delete(`/admin/users/${id}`); fetchAll(); feedback(true, 'Usuário deletado.'); }
    catch { feedback(false, 'Erro ao deletar.'); }
  }

  async function suspender(e) {
    e.preventDefault();
    try {
      await api.post(`/admin/users/${suspendModal.userId}/suspend`, {
        motivo: suspendForm.motivo,
        ate: suspendForm.permanente ? null : (suspendForm.ate || null),
      });
      setSuspendModal(null);
      setSuspendForm({ motivo: '', ate: '', permanente: false });
      fetchAll();
      feedback(true, 'Usuário suspenso.');
    } catch { feedback(false, 'Erro ao suspender.'); }
  }

  async function unsuspend(id) {
    try { await api.post(`/admin/users/${id}/unsuspend`); fetchAll(); feedback(true, 'Suspensão removida.'); }
    catch { feedback(false, 'Erro ao remover suspensão.'); }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>Painel Admin ⚙️</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Gerencie conteúdos, quizzes e usuários</p>
        </div>

        {msg  && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)', fontSize: '0.88rem' }}>{msg}</div>}
        {erro && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', fontSize: '0.88rem' }}>{erro}</div>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {TAB.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              background: tab === i ? 'var(--accent)' : 'var(--surface)',
              color: tab === i ? '#fff' : 'var(--muted)',
              border: tab === i ? 'none' : '1px solid var(--border)',
            }}>{t}</button>
          ))}
        </div>

        {/* ABA CONTEÚDOS */}
        <div style={{ display: tab === 0 ? 'block' : 'none' }}>
          <div style={{ ...s.card, marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Novo conteúdo</h2>
            <form onSubmit={criarConteudo} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={s.label}>Título</label><input style={s.input} value={novoConteudo.titulo} onChange={e => setNovoConteudo({ ...novoConteudo, titulo: e.target.value })} required /></div>
              <div><label style={s.label}>Descrição curta</label><input style={s.input} value={novoConteudo.descricao} onChange={e => setNovoConteudo({ ...novoConteudo, descricao: e.target.value })} /></div>
              <div><label style={s.label}>Corpo do conteúdo</label><textarea style={{ ...s.input, minHeight: 120, resize: 'vertical' }} value={novoConteudo.corpo} onChange={e => setNovoConteudo({ ...novoConteudo, corpo: e.target.value })} required /></div>
              <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>Publicar</button>
            </form>
          </div>

          {editando && (
            <div style={{ ...s.card, marginBottom: 24, border: '1px solid var(--accent)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Editando: {editando.titulo}</h2>
              <form onSubmit={salvarEdicao} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={s.label}>Título</label><input style={s.input} value={editando.titulo} onChange={e => setEditando({ ...editando, titulo: e.target.value })} required /></div>
                <div><label style={s.label}>Descrição curta</label><input style={s.input} value={editando.descricao || ''} onChange={e => setEditando({ ...editando, descricao: e.target.value })} /></div>
                <div><label style={s.label}>Corpo</label><textarea style={{ ...s.input, minHeight: 120, resize: 'vertical' }} value={editando.corpo} onChange={e => setEditando({ ...editando, corpo: e.target.value })} required /></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Salvar</button>
                  <button type="button" onClick={() => setEditando(null)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                </div>
              </form>
            </div>
          )}

          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 12 }}>Conteúdos ({conteudos.length})</h3>
          {conteudos.map(c => (
            <div key={c.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontWeight: 600 }}>{c.titulo}</div><div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>{c.descricao}</div></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditando(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ padding: '7px 14px', background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.3)', borderRadius: 8, color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Editar</button>
                <button onClick={() => deletarConteudo(c.id)} style={{ padding: '7px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 8, color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Deletar</button>
              </div>
            </div>
          ))}
        </div>

        {/* ABA QUIZZES */}
        <div style={{ display: tab === 1 ? 'block' : 'none' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 12 }}>Quizzes ({quizzes.length})</h3>
          {quizzes.map(q => (
            <div key={q.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{q.titulo}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>{q._count?.questoes ?? 0} questões {q.autor ? `• por ${q.autor.name}` : '• EduRank'}</div>
              </div>
              <button onClick={() => deletarQuiz(q.id)} style={{ padding: '7px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 8, color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Deletar</button>
            </div>
          ))}
        </div>

        {/* ABA USUÁRIOS */}
        <div style={{ display: tab === 2 ? 'block' : 'none' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 12 }}>Usuários ({usuarios.length})</h3>
          {usuarios.map(u => (
            <div key={u.id} style={{ ...s.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{u.name} <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>@{u.username}</span>
                  {u.suspended && <span style={{ marginLeft: 8, fontSize: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 8px', borderRadius: 99 }}>SUSPENSO</span>}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
                  {nomeDoNivel(u.level)} • {u.totalPoints} pts • <span style={{ color: u.role === 'ADMIN' ? 'var(--accent)' : 'var(--muted)' }}>{u.role}</span>
                  {u.suspended && u.suspendedReason && <span style={{ marginLeft: 6 }}>| Motivo: {u.suspendedReason}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => alterarRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')} style={{ padding: '7px 14px', background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.3)', borderRadius: 8, color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                  {u.role === 'ADMIN' ? 'Remover admin' : 'Tornar admin'}
                </button>
                {u.id !== user?.id && (
                  <>
                    {u.suspended ? (
                      <button onClick={() => unsuspend(u.id)} style={{ padding: '7px 14px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 8, color: 'var(--success-text)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Reativar</button>
                    ) : (
                      <button onClick={() => { setSuspendModal({ userId: u.id, name: u.name }); setSuspendForm({ motivo: '', ate: '', permanente: false }); }} style={{ padding: '7px 14px', background: 'rgba(247,194,106,0.15)', border: '1px solid rgba(247,194,106,0.3)', borderRadius: 8, color: 'var(--accent2)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Suspender</button>
                    )}
                    <button onClick={() => deletarUsuario(u.id)} style={{ padding: '7px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 8, color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Deletar</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ABA LOGS */}
        <div style={{ display: tab === 3 ? 'block' : 'none' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 12 }}>Logs administrativos</h3>
          {logs.map(l => (
            <div key={l.id} style={{ ...s.card }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--accent)' }}>{l.acao}</span>
                  <span style={{ marginLeft: 8, fontSize: '0.82rem', color: 'var(--muted)' }}>por {l.admin?.name}</span>
                  {l.detalhes && <div style={{ fontSize: '0.82rem', color: 'var(--text2)', marginTop: 4 }}>{l.detalhes}</div>}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {new Date(l.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal de suspensão */}
      {suspendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 20 }}>Suspender {suspendModal.name}</h2>
            <form onSubmit={suspender} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={s.label}>Motivo</label>
                <input style={s.input} value={suspendForm.motivo} onChange={e => setSuspendForm({ ...suspendForm, motivo: e.target.value })} placeholder="Ex: Violação dos termos de uso" required />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="perm" checked={suspendForm.permanente} onChange={e => setSuspendForm({ ...suspendForm, permanente: e.target.checked })} />
                <label htmlFor="perm" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Suspensão permanente</label>
              </div>
              {!suspendForm.permanente && (
                <div>
                  <label style={s.label}>Data de término (opcional)</label>
                  <input type="datetime-local" style={s.input} value={suspendForm.ate} onChange={e => setSuspendForm({ ...suspendForm, ate: e.target.value })} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="submit" style={{ flex: 1, padding: 12, background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Suspender</button>
                <button type="button" onClick={() => setSuspendModal(null)} style={{ flex: 1, padding: 12, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
