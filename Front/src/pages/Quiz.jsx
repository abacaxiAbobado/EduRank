import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import QuizCard from '../components/QuizCard';
import QuizForm from '../components/QuizForm';
import { getQuizzes, getQuiz, responderQuiz, createQuiz, updateQuiz } from '../services/quizService';
import { useAuth } from '../hooks/useAuth';
import { nomeDoNivel } from '../utils/levelCalculator';
import { linkify } from '../utils/linkify.jsx';

export default function Quiz() {
  const { user, refreshUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);        // null | 'loading' | { questoes, index, respostas, id, titulo }
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [mode, setMode] = useState(null);          // null | 'criar' | { editando: quiz }

  useEffect(() => { loadQuizzes(); }, []);

  async function loadQuizzes() {
    setLoading(true);
    try { setQuizzes(await getQuizzes()); } finally { setLoading(false); }
  }

  function showToast(msg, tipo = 'success') {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  async function startQuiz(quiz) {
    setModal('loading'); setResult(null);
    try {
      const data = await getQuiz(quiz.id);
      setModal({ questoes: data.questoes, index: 0, respostas: [], id: quiz.id, titulo: quiz.titulo });
      setSelected(null);
    } catch {
      setModal(null);
      showToast('Erro ao carregar o quiz.', 'error');
    }
  }

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
      setResult(data);
      await refreshUser();
      const msg = data.pontosGanhos > 0
        ? `+${data.pontosGanhos} pontos!${data.subioDeNivel ? ` 🎉 Subiu para ${data.levelNome}!` : ''}`
        : 'Quiz concluído! Você já acertou estas questões antes.';
      showToast(msg);
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Erro ao enviar respostas.' });
    } finally { setSubmitting(false); }
  }

  async function handleCreate(form) {
    await createQuiz(form);
    setMode(null);
    await loadQuizzes();
    showToast('Quiz criado com sucesso!');
  }

  async function handleEdit(form) {
    await updateQuiz(mode.editando.id, form);
    setMode(null);
    await loadQuizzes();
    showToast('Quiz atualizado!');
  }

  function canEdit(quiz) {
    return user?.role === 'ADMIN' || quiz.autorId === user?.id;
  }

  function openEdit(quiz) {
    // Precisamos dos dados completos com questões para pré-preencher o form
    getQuiz(quiz.id).then(data => {
      setMode({ editando: { ...quiz, ...data } });
    });
  }

  const q = modal && modal !== 'loading' && !result ? modal.questoes[modal.index] : null;
  const pct = modal && modal !== 'loading' ? Math.round((modal.index / modal.questoes.length) * 100) : 0;

  const canCreate = user?.level >= 3 || user?.role === 'ADMIN';

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>Quizzes 🧠</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
              Teste seus conhecimentos e ganhe pontos. Você pode refazer qualquer quiz!
            </p>
          </div>
          {canCreate && (
            <button onClick={() => setMode(mode ? null : 'criar')} style={{
              padding: '10px 20px', background: mode ? 'transparent' : 'var(--accent)',
              border: mode ? '1px solid var(--border)' : 'none',
              borderRadius: 10, color: mode ? 'var(--muted)' : '#fff',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
            }}>
              {mode ? 'Cancelar' : '+ Criar quiz'}
            </button>
          )}
        </div>

        {/* Criar quiz */}
        {mode === 'criar' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 16, padding: 24, marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Criar novo quiz</h2>
            <QuizForm onSubmit={handleCreate} onCancel={() => setMode(null)} submitLabel="Publicar quiz" />
          </div>
        )}

        {/* Editar quiz */}
        {mode?.editando && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 16, padding: 24, marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>
              Editando: {mode.editando.titulo}
            </h2>
            <QuizForm
              initialData={{
                titulo: mode.editando.titulo,
                descricao: mode.editando.descricao || '',
                questoes: mode.editando.questoes?.map(q => ({
                  pergunta: q.pergunta,
                  alternativas: q.alternativas,
                  respostaCorreta: q.respostaCorreta,
                  explicacao: q.explicacao || '',
                })) || []
              }}
              onSubmit={handleEdit}
              onCancel={() => setMode(null)}
              submitLabel="Salvar alterações"
            />
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Carregando...</div>
        ) : quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Nenhum quiz disponível ainda.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {quizzes.map(q => (
              <QuizCard key={q.id} quiz={q} onStart={startQuiz} onEdit={openEdit} canEdit={canEdit(q)} />
            ))}
          </div>
        )}
      </main>

      {/* Modal do quiz */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem' }}>
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
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {result.percentual}
                    </div>
                    <div style={{ color: 'var(--muted)', marginBottom: 8 }}>{result.acertos} de {result.total} acertos</div>
                    {result.acertosNovos < result.acertos && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 12 }}>
                        ({result.acertos - result.acertosNovos} já acertadas antes — sem pontos extras)
                      </div>
                    )}
                    <div style={{ display: 'inline-block', background: 'rgba(247,194,106,0.15)', color: 'var(--accent2)', padding: '8px 20px', borderRadius: 99, fontWeight: 600, fontSize: '0.9rem', marginBottom: 16 }}>
                      +{result.pontosGanhos} pontos ganhos ⭐
                    </div>
                    {result.subioDeNivel && (
                      <div style={{ color: 'var(--accent3)', fontWeight: 600, marginBottom: 12 }}>
                        🎉 Você subiu para {result.levelNome}!
                      </div>
                    )}
                    {/* Gabarito */}
                    <div style={{ marginTop: 16, textAlign: 'left' }}>
                      {result.resultado?.map((r, i) => (
                        <div key={i} style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 8, background: r.acertou ? 'var(--success-bg)' : 'var(--danger-bg)', border: `1px solid ${r.acertou ? 'var(--success-border)' : 'var(--danger-border)'}` }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: r.acertou ? 'var(--success-text)' : 'var(--danger)' }}>
                            {r.acertou ? '✓' : '✗'} {r.pergunta}
                          </div>
                          {!r.acertou && <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>Correto: {r.respostaCorreta}</div>}
                          {r.explicacao && <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginTop: 4 }}>{linkify(r.explicacao)}</div>}
                          {r.ganhaPontos === false && r.acertou && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>Já acertada antes</div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <button onClick={() => { setModal(null); setResult(null); }} style={{ width: '100%', marginTop: 16, padding: 13, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}>Fechar</button>
              </div>
            ) : q ? (
              <>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 6 }}>
                    <span>Questão {modal.index + 1} de {modal.questoes.length}</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: 'linear-gradient(90deg, var(--accent), var(--accent2))', transition: 'width 0.3s' }} />
                  </div>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: 18, lineHeight: 1.5 }}>{q.pergunta}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {q.alternativas.map((alt) => (
                    <button key={alt} onClick={() => setSelected(alt)} style={{
                      padding: '14px 18px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                      border: `1px solid ${selected === alt ? 'var(--accent)' : 'var(--border)'}`,
                      background: selected === alt ? 'rgba(124,106,247,0.15)' : 'var(--bg)',
                      color: selected === alt ? 'var(--accent)' : 'var(--text)',
                      fontSize: '0.92rem', transition: 'all 0.15s'
                    }}>{alt}</button>
                  ))}
                </div>
                <button onClick={next} disabled={!selected} style={{
                  width: '100%', padding: 13, background: 'var(--accent)', color: '#fff',
                  border: 'none', borderRadius: 10, fontFamily: 'var(--font-heading)',
                  fontSize: '0.95rem', fontWeight: 700,
                  cursor: selected ? 'pointer' : 'not-allowed', opacity: selected ? 1 : 0.4
                }}>
                  {modal.index < modal.questoes.length - 1 ? 'Próxima →' : 'Ver resultado'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 300,
          background: 'var(--surface)', borderLeft: `3px solid ${toast.tipo === 'error' ? 'var(--danger)' : 'var(--accent3)'}`,
          border: '1px solid var(--border)', borderRadius: 12,
          padding: '14px 20px', fontSize: '0.88rem', maxWidth: 320,
        }}>{toast.msg}</div>
      )}
    </div>
  );
}
