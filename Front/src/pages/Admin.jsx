import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const TAB = ['Conteúdos', 'Quizzes', 'Usuários'];

const questaoVazia = () => ({ pergunta: '', alternativas: ['', '', '', ''], respostaCorreta: '' });

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const [conteudos, setConteudos] = useState([]);
  const [novoConteudo, setNovoConteudo] = useState({ titulo: '', descricao: '', corpo: '' });
  const [editando, setEditando] = useState(null);

  const [quizzes, setQuizzes] = useState([]);
  const [novoQuiz, setNovoQuiz] = useState({ titulo: '', descricao: '', questoes: [questaoVazia()] });

  const [usuarios, setUsuarios] = useState([]);
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (user?.role !== 'ADMIN') { navigate('/dashboard'); return; }
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [c, q, u] = await Promise.all([
        api.get('/content').then(r => r.data),
        api.get('/quizzes').then(r => r.data),
        api.get('/admin/users').then(r => r.data),
      ]);
      setConteudos(c); setQuizzes(q); setUsuarios(u);
    } catch { feedback(false, 'Erro ao carregar dados.'); }
  }

  function feedback(ok, texto) {
    if (ok) { setMsg(texto); setErro(''); }
    else { setErro(texto); setMsg(''); }
    setTimeout(() => { setMsg(''); setErro(''); }, 3000);
  }

  // ── CONTEÚDOS ──────────────────────────────────────────
  async function criarConteudo(e) {
    e.preventDefault();
    try {
      await api.post('/admin/conteudos', novoConteudo);
      setNovoConteudo({ titulo: '', descricao: '', corpo: '' });
      fetchAll(); feedback(true, 'Conteúdo criado!');
    } catch { feedback(false, 'Erro ao criar conteúdo.'); }
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    try {
      await api.put(`/admin/conteudos/${editando.id}`, editando);
      setEditando(null); fetchAll(); feedback(true, 'Conteúdo atualizado!');
    } catch { feedback(false, 'Erro ao atualizar conteúdo.'); }
  }

  async function deletarConteudo(id) {
    if (!confirm('Deletar este conteúdo?')) return;
    try {
      await api.delete(`/admin/conteudos/${id}`);
      fetchAll(); feedback(true, 'Conteúdo deletado.');
    } catch { feedback(false, 'Erro ao deletar.'); }
  }

  // ── QUIZZES ────────────────────────────────────────────
  function atualizarQuestao(i, campo, valor) {
    const qs = [...novoQuiz.questoes];
    qs[i] = { ...qs[i], [campo]: valor };
    setNovoQuiz({ ...novoQuiz, questoes: qs });
  }

  function atualizarAlternativa(qi, ai, valor) {
    const qs = [...novoQuiz.questoes];
    const alts = [...qs[qi].alternativas];
    alts[ai] = valor;
    qs[qi] = { ...qs[qi], alternativas: alts };
    setNovoQuiz({ ...novoQuiz, questoes: qs });
  }

  function adicionarQuestao() {
    setNovoQuiz({ ...novoQuiz, questoes: [...novoQuiz.questoes, questaoVazia()] });
  }

  function removerQuestao(i) {
    if (novoQuiz.questoes.length === 1) return;
    const qs = novoQuiz.questoes.filter((_, idx) => idx !== i);
    setNovoQuiz({ ...novoQuiz, questoes: qs });
  }

  async function criarQuiz(e) {
    e.preventDefault();
    for (const q of novoQuiz.questoes) {
      if (!q.pergunta) return feedback(false, 'Preencha todas as perguntas.');
      if (q.alternativas.some(a => !a)) return feedback(false, 'Preencha todas as alternativas.');
      if (!q.respostaCorreta) return feedback(false, 'Selecione a resposta correta de cada questão.');
      if (!q.alternativas.includes(q.respostaCorreta)) return feedback(false, 'A resposta correta deve ser uma das alternativas.');
    }
    try {
      await api.post('/quizzes', novoQuiz);
      setNovoQuiz({ titulo: '', descricao: '', questoes: [questaoVazia()] });
      fetchAll(); feedback(true, 'Quiz criado!');
    } catch { feedback(false, 'Erro ao criar quiz.'); }
  }

  async function deletarQuiz(id) {
    if (!confirm('Deletar este quiz?')) return;
    try {
      await api.delete(`/admin/quizzes/${id}`);
      fetchAll(); feedback(true, 'Quiz deletado.');
    } catch { feedback(false, 'Erro ao deletar.'); }
  }

  // ── USUÁRIOS ───────────────────────────────────────────
  async function alterarRole(id, role) {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      fetchAll(); feedback(true, 'Role atualizado!');
    } catch { feedback(false, 'Erro ao atualizar role.'); }
  }

  async function deletarUsuario(id) {
    if (!confirm('Deletar este usuário? Esta ação não pode ser desfeita.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchAll(); feedback(true, 'Usuário deletado.');
    } catch { feedback(false, 'Erro ao deletar.'); }
  }

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 10 };
  const input = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' };
  const label = { fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>Painel Admin ⚙️</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Gerencie conteúdos, quizzes e usuários</p>
        </div>

        {msg  && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', color: '#1D9E75', fontSize: '0.88rem' }}>{msg}</div>}
        {erro && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: 'rgba(247,106,106,0.1)', border: '1px solid rgba(247,106,106,0.3)', color: 'var(--danger)', fontSize: '0.88rem' }}>{erro}</div>}

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

        {/* ── ABA CONTEÚDOS ── */}
        {tab === 0 && (
          <div>
            <div style={{ ...card, marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Novo conteúdo</h2>
              <form onSubmit={criarConteudo} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label style={label}>Título</label><input style={input} value={novoConteudo.titulo} onChange={e => setNovoConteudo({ ...novoConteudo, titulo: e.target.value })} required /></div>
                <div><label style={label}>Descrição curta</label><input style={input} value={novoConteudo.descricao} onChange={e => setNovoConteudo({ ...novoConteudo, descricao: e.target.value })} /></div>
                <div><label style={label}>Corpo do conteúdo</label><textarea style={{ ...input, minHeight: 120, resize: 'vertical' }} value={novoConteudo.corpo} onChange={e => setNovoConteudo({ ...novoConteudo, corpo: e.target.value })} required /></div>
                <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>Publicar</button>
              </form>
            </div>

            {editando && (
              <div style={{ ...card, marginBottom: 24, border: '1px solid var(--accent)' }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Editando: {editando.titulo}</h2>
                <form onSubmit={salvarEdicao} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><label style={label}>Título</label><input style={input} value={editando.titulo} onChange={e => setEditando({ ...editando, titulo: e.target.value })} required /></div>
                  <div><label style={label}>Descrição curta</label><input style={input} value={editando.descricao || ''} onChange={e => setEditando({ ...editando, descricao: e.target.value })} /></div>
                  <div><label style={label}>Corpo do conteúdo</label><textarea style={{ ...input, minHeight: 120, resize: 'vertical' }} value={editando.corpo} onChange={e => setEditando({ ...editando, corpo: e.target.value })} required /></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Salvar</button>
                    <button type="button" onClick={() => setEditando(null)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                  </div>
                </form>
              </div>
            )}

            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 12 }}>Conteúdos publicados ({conteudos.length})</h3>
            {conteudos.length === 0
              ? <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum conteúdo ainda.</div>
              : conteudos.map(c => (
                <div key={c.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.titulo}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>{c.descricao}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setEditando(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ padding: '7px 14px', background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.3)', borderRadius: 8, color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Editar</button>
                    <button onClick={() => deletarConteudo(c.id)} style={{ padding: '7px 14px', background: 'rgba(247,106,106,0.15)', border: '1px solid rgba(247,106,106,0.3)', borderRadius: 8, color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Deletar</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── ABA QUIZZES ── */}
        {tab === 1 && (
          <div>
            {/* Formulário de criação */}
            <div style={{ ...card, marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Novo quiz</h2>
              <form onSubmit={criarQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><label style={label}>Título</label><input style={input} value={novoQuiz.titulo} onChange={e => setNovoQuiz({ ...novoQuiz, titulo: e.target.value })} required /></div>
                <div><label style={label}>Descrição</label><input style={input} value={novoQuiz.descricao} onChange={e => setNovoQuiz({ ...novoQuiz, descricao: e.target.value })} /></div>

                {novoQuiz.questoes.map((q, qi) => (
                  <div key={qi} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Questão {qi + 1}</span>
                      {novoQuiz.questoes.length > 1 && (
                        <button type="button" onClick={() => removerQuestao(qi)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem' }}>Remover</button>
                      )}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={label}>Pergunta</label>
                      <input style={input} value={q.pergunta} onChange={e => atualizarQuestao(qi, 'pergunta', e.target.value)} required />
                    </div>
                    <label style={label}>Alternativas</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                      {q.alternativas.map((alt, ai) => (
                        <input key={ai} style={input} placeholder={`Alternativa ${ai + 1}`} value={alt} onChange={e => atualizarAlternativa(qi, ai, e.target.value)} required />
                      ))}
                    </div>
                    <div>
                      <label style={label}>Resposta correta</label>
                      <select style={input} value={q.respostaCorreta} onChange={e => atualizarQuestao(qi, 'respostaCorreta', e.target.value)} required>
                        <option value="">Selecione...</option>
                        {q.alternativas.filter(a => a).map((alt, ai) => (
                          <option key={ai} value={alt}>{alt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={adicionarQuestao} style={{ padding: '10px 20px', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>+ Adicionar questão</button>
                <button type="submit" style={{ padding: '10px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>Publicar quiz</button>
              </form>
            </div>

            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 12 }}>Quizzes publicados ({quizzes.length})</h3>
            {quizzes.length === 0
              ? <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum quiz ainda.</div>
              : quizzes.map(q => (
                <div key={q.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{q.titulo}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>{q._count?.questoes ?? 0} questões • por {q.autor?.name}</div>
                  </div>
                  <button onClick={() => deletarQuiz(q.id)} style={{ padding: '7px 14px', background: 'rgba(247,106,106,0.15)', border: '1px solid rgba(247,106,106,0.3)', borderRadius: 8, color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Deletar</button>
                </div>
              ))
            }
          </div>
        )}

        {/* ── ABA USUÁRIOS ── */}
        {tab === 2 && (
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 12 }}>Usuários ({usuarios.length})</h3>
            {usuarios.length === 0
              ? <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum usuário.</div>
              : usuarios.map(u => (
                <div key={u.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.name} <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>@{u.username}</span></div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>Nível {u.level} • {u.totalPoints} pts • <span style={{ color: u.role === 'ADMIN' ? 'var(--accent)' : 'var(--muted)' }}>{u.role}</span></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => alterarRole(u.id, u.role === 'ADMIN' ? 'USER' : 'ADMIN')} style={{ padding: '7px 14px', background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.3)', borderRadius: 8, color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      {u.role === 'ADMIN' ? 'Remover admin' : 'Tornar admin'}
                    </button>
                    {u.id !== user?.id && (
                      <button onClick={() => deletarUsuario(u.id)} style={{ padding: '7px 14px', background: 'rgba(247,106,106,0.15)', border: '1px solid rgba(247,106,106,0.3)', borderRadius: 8, color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Deletar</button>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </main>
    </div>
  );
}