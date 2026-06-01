import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import QuizCard from '../components/QuizCard';
import { getQuizzes, getQuiz, responderQuiz } from '../services/quizService';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const questaoVazia = () => ({ pergunta: '', alternativas: ['', '', '', ''], respostaCorreta: '' });

export default function Quiz() {
  const { user, refreshUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [criando, setCriando] = useState(false);
  const [novoQuiz, setNovoQuiz] = useState({ titulo: '', descricao: '', questoes: [questaoVazia()] });
  const [erroForm, setErroForm] = useState('');

  useEffect(() => {
    getQuizzes().then(setQuizzes).finally(() => setLoading(false));
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function startQuiz(quiz) {
    setModal('loading'); setResult(null);
    try {
      const data = await getQuiz(quiz.id);
      setModal({ questoes: data.questoes, index: 0, respostas: [], id: quiz.id, titulo: quiz.titulo });
      setSelected(null);
    } catch {
      setModal(null);
      showToast('Erro ao carregar o quiz. Tente novamente.');
    }
  }

  function selectOption(value) { setSelected(value); }

  function next() {
    const { questoes, index, respostas, id, titulo } = modal;
    const newRespostas = [...respostas, { questaoId: questoes[index].id, resposta: selected }];
    setSelected(null);
    if (index < questoes.length - 1) {
      setModal({ questoes, index: index + 1, respostas: newRespostas, id, titulo });
    } else {
      submit(id, newRespostas);
    }
  }

  async function submit(id, respostas) {
    setSubmitting(true);
    try {
      const data = await responderQuiz(id, respostas);
      setResult(data); refreshUser();
      showToast(`+${data.pontosGanhos} pontos! ${data.subioDeNivel ? '🎉 Subiu de nível!' : ''}`);
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Erro ao enviar respostas.' });
    } finally { setSubmitting(false); }
  }

  // ── CRIAR QUIZ ──────────────────────────────────────────
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
    setNovoQuiz({ ...novoQuiz, questoes: novoQuiz.questoes.filter((_, idx) => idx !== i) });
  }

  async function criarQuiz(e) {
    e.preventDefault(); setErroForm('');
    for (const q of novoQuiz.questoes) {
      if (!q.pergunta) return setErroForm('Preencha todas as perguntas.');
      if (q.alternativas.some(a => !a)) return setErroForm('Preencha todas as alternativas.');
      if (!q.respostaCorreta) return setErroForm('Selecione a resposta correta de cada questão.');
    }
    try {
      await api.post('/quizzes', novoQuiz);
      setNovoQuiz({ titulo: '', descricao: '', questoes: [questaoVazia()] });
      setCriando(false);
      const data = await getQuizzes();
      setQuizzes(data);
      showToast('Quiz criado com sucesso!');
    } catch (err) {
      setErroForm(err.response?.data?.error || 'Erro ao criar quiz.');
    }
  }

  const q = modal && modal !== 'loading' && !result ? modal.questoes[modal.index] : null;
  const pct = modal && modal !== 'loading' ? Math.round((modal.index / modal.questoes.length) * 100) : 0;
  const input = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' };
  const label = { fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>Quizzes 🧠</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Teste seus conhecimentos e ganhe pontos</p>
          </div>
          {user?.level >= 3 && (
            <button onClick={() => setCriando(!criando)} style={{
              padding: '10px 20px', background: criando ? 'transparent' : 'var(--accent)',
              border: criando ? '1px solid var(--border)' : 'none',
              borderRadius: 10, color: criando ? 'var(--muted)' : '#fff',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
            }}>
              {criando ? 'Cancelar' : '+ Criar quiz'}
            </button>
          )}
        </div>

        {/* Formulário de criação */}
        {criando && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 16, padding: 24, marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Criar novo quiz</h2>
            {erroForm && <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: 'rgba(247,106,106,0.1)', border: '1px solid rgba(247,106,106,0.3)', color: 'var(--danger)', fontSize: '0.88rem' }}>{erroForm}</div>}
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
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Carregando...</div>
        ) : quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Nenhum quiz disponível ainda.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {quizzes.map(q => <QuizCard key={q.id} quiz={q} onStart={startQuiz} />)}
          </div>
        )}
      </main>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem' }}>
                {modal === 'loading' ? 'Carregando...' : modal.titulo}
              </h2>
              {!submitting && (
                <button onClick={() => { setModal(null); setResult(null); }} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem' }}>✕</button>
              )}
            </div>

            {modal === 'loading' || submitting ? (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>
                {submitting ? 'Calculando resultado...' : 'Carregando...'}
              </div>
            ) : result ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                {result.error ? (
                  <div style={{ color: 'var(--danger)', marginBottom: 20 }}>{result.error}</div>
                ) : (
                  <>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '3.5rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{result.percentual}</div>
                    <div style={{ color: 'var(--muted)', marginBottom: 16 }}>{result.acertos} de {result.total} acertos</div>
                    <div style={{ display: 'inline-block', background: 'rgba(247,194,106,0.15)', color: 'var(--accent2)', padding: '8px 20px', borderRadius: 99, fontWeight: 600, fontSize: '0.9rem', marginBottom: 20 }}>+{result.pontosGanhos} pontos ganhos ⭐</div>
                    {result.subioDeNivel && <div style={{ color: 'var(--accent3)', fontWeight: 600, marginBottom: 12 }}>🎉 Você subiu para o nível {result.level}!</div>}
                  </>
                )}
                <button onClick={() => { setModal(null); setResult(null); }} style={{ width: '100%', padding: 13, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'Syne, sans-serif', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}>Fechar</button>
              </div>
            ) : q ? (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 6 }}>
                    <span>Questão {modal.index + 1} de {modal.questoes.length}</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: 'linear-gradient(90deg, var(--accent), var(--accent2))', transition: 'width 0.3s' }} />
                  </div>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: 18, lineHeight: 1.5 }}>{q.pergunta}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {q.alternativas.map((alt) => (
                    <button key={alt} onClick={() => selectOption(alt)} style={{ padding: '14px 18px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', border: `1px solid ${selected === alt ? 'var(--accent)' : 'var(--border)'}`, background: selected === alt ? 'rgba(124,106,247,0.15)' : 'var(--bg)', color: selected === alt ? 'var(--accent)' : 'var(--text)', fontSize: '0.92rem', transition: 'all 0.15s' }}>{alt}</button>
                  ))}
                </div>
                <button onClick={next} disabled={!selected} style={{ width: '100%', padding: 13, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'Syne, sans-serif', fontSize: '0.95rem', fontWeight: 700, cursor: selected ? 'pointer' : 'not-allowed', opacity: selected ? 1 : 0.4 }}>
                  {modal.index < modal.questoes.length - 1 ? 'Próxima →' : 'Ver resultado'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 300, background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent3)', borderRadius: 12, padding: '14px 20px', fontSize: '0.88rem' }}>{toast}</div>
      )}
    </div>
  );
}