import { useState } from 'react';

const questaoVazia = () => ({ pergunta: '', alternativas: ['', '', '', ''], respostaCorreta: '', explicacao: '' });

const s = {
  input: { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none' },
  label: { fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px', display: 'block', marginBottom: 6 },
};

export default function QuizForm({ initialData, onSubmit, onCancel, submitLabel = 'Publicar quiz' }) {
  const [form, setForm] = useState(initialData || { titulo: '', descricao: '', questoes: [questaoVazia()] });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  function atualizarQuestao(i, campo, valor) {
    const qs = [...form.questoes];
    qs[i] = { ...qs[i], [campo]: valor };
    setForm({ ...form, questoes: qs });
  }

  function atualizarAlternativa(qi, ai, valor) {
    const qs = [...form.questoes];
    const alts = [...qs[qi].alternativas];
    alts[ai] = valor;
    qs[qi] = { ...qs[qi], alternativas: alts };
    setForm({ ...form, questoes: qs });
  }

  function adicionarQuestao() {
    setForm({ ...form, questoes: [...form.questoes, questaoVazia()] });
  }

  function removerQuestao(i) {
    if (form.questoes.length === 1) return;
    setForm({ ...form, questoes: form.questoes.filter((_, idx) => idx !== i) });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    for (const q of form.questoes) {
      if (!q.pergunta) return setErro('Preencha todas as perguntas.');
      if (q.alternativas.some(a => !a)) return setErro('Preencha todas as alternativas.');
      if (!q.respostaCorreta) return setErro('Selecione a resposta correta de cada questão.');
    }
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao salvar quiz.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {erro && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', fontSize: '0.88rem' }}>
          {erro}
        </div>
      )}

      <div>
        <label style={s.label}>Título *</label>
        <input style={s.input} value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required />
      </div>

      <div>
        <label style={s.label}>Descrição <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>(suporta links https://...)</span></label>
        <input style={s.input} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Opcional" />
      </div>

      {form.questoes.map((q, qi) => (
        <div key={qi} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Questão {qi + 1}</span>
            {form.questoes.length > 1 && (
              <button type="button" onClick={() => removerQuestao(qi)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem' }}>Remover</button>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>Pergunta *</label>
            <input style={s.input} value={q.pergunta} onChange={e => atualizarQuestao(qi, 'pergunta', e.target.value)} required />
          </div>

          <label style={s.label}>Alternativas *</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {q.alternativas.map((alt, ai) => (
              <input key={ai} style={s.input} placeholder={`Alternativa ${ai + 1}`} value={alt} onChange={e => atualizarAlternativa(qi, ai, e.target.value)} required />
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>Resposta correta *</label>
            <select style={s.input} value={q.respostaCorreta} onChange={e => atualizarQuestao(qi, 'respostaCorreta', e.target.value)} required>
              <option value="">Selecione...</option>
              {q.alternativas.filter(a => a).map((alt, ai) => (
                <option key={ai} value={alt}>{alt}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={s.label}>Explicação <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>(opcional — mostrada após responder)</span></label>
            <input style={s.input} value={q.explicacao || ''} onChange={e => atualizarQuestao(qi, 'explicacao', e.target.value)} placeholder="Ex: A resposta correta é... porque..." />
          </div>
        </div>
      ))}

      <button type="button" onClick={adicionarQuestao} style={{ padding: '10px 20px', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>
        + Adicionar questão
      </button>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" disabled={loading} style={{ flex: 1, padding: '11px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Salvando...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ padding: '11px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
