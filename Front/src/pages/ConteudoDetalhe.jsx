import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getConteudo } from '../services/contentService';
import { linkify } from '../utils/linkify.jsx';

export default function ConteudoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conteudo, setConteudo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    getConteudo(id)
      .then(setConteudo)
      .catch(() => setErro('Não foi possível carregar este conteúdo.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh', boxSizing: 'border-box' }}>
        <button onClick={() => navigate('/content')} style={{
          background: 'transparent', border: '1px solid var(--border)', borderRadius: 8,
          color: 'var(--muted)', padding: '8px 16px', cursor: 'pointer', fontSize: '0.88rem',
          marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6,
        }}>← Voltar</button>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Carregando...</div>
        ) : erro ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--danger)' }}>{erro}</div>
        ) : (
          <>
            <span style={{
              display: 'inline-block', fontSize: '0.72rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.8px',
              padding: '3px 10px', borderRadius: 99, marginBottom: 16,
              background: 'rgba(124,106,247,0.15)', color: 'var(--accent)',
            }}>Conteúdo</span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', marginBottom: 8 }}>{conteudo.titulo}</h1>
            {conteudo.descricao && (
              <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: 32 }}>{conteudo.descricao}</p>
            )}
            <div style={{
              lineHeight: 1.9, color: 'var(--text)', fontSize: '1rem',
              whiteSpace: 'pre-wrap', borderTop: '1px solid var(--border)', paddingTop: 28,
              wordBreak: 'break-word', overflowWrap: 'break-word',
            }}>
              {linkify(conteudo.corpo)}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
