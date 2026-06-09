import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import { useSidebar } from '../hooks/useSidebar';
import RankingCard from '../components/RankingCard';
import { getRanking } from '../services/rankingService';

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const sidebar = useSidebar();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRanking().then(setRanking).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <MobileHeader onOpen={sidebar.open} />
      <Sidebar isOpen={sidebar.isOpen} onClose={sidebar.close} />
      <main style={{ marginLeft: 'var(--sidebar-width, 240px)', flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>Ranking 🏆</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Os melhores estudantes da plataforma</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Carregando...</div>
        ) : ranking.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--muted)' }}>Nenhum usuário no ranking ainda.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ranking.map((u, i) => <RankingCard key={u.id} user={u} index={i} />)}
          </div>
        )}
      </main>
    </div>
  );
}
