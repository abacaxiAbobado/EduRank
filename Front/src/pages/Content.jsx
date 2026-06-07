import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getConteudos } from '../services/contentService';

export default function Content() {
  const [conteudos, setConteudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getConteudos().then(setConteudos).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>Conteúdos 📚</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Estude antes de fazer os quizzes</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Carregando...</div>
        ) : conteudos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Nenhum conteúdo disponível ainda.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {conteudos.map(c => (
              <div key={c.id} onClick={() => navigate(`/content/${c.id}`)} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: 22, cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <span style={{
                  display: 'inline-block', fontSize: '0.72rem', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                  padding: '3px 10px', borderRadius: 99, marginBottom: 12,
                  background: 'rgba(124,106,247,0.15)', color: 'var(--accent)',
                }}>Conteúdo</span>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{c.titulo}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>{c.descricao || 'Clique para ler.'}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
                  <button style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Ler →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
