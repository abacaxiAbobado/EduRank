import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { User } from '../types.js';
import { Trophy, HelpCircle, GraduationCap, Medal, Search, Star } from 'lucide-react';

export default function Leaderboard() {
  const [ranking, setRanking] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const data = await api.getRanking();
      setRanking(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar ranking global.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRanking = ranking.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-left">
      
      {/* Header and description banner */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-150 dark:border-neutral-700/85 flex flex-col sm:flex-row gap-5 items-center justify-between shadow-sm transition-all">
        <div className="flex items-center gap-3.5 text-left">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/45 rounded-xl text-yellow-500">
            <Trophy size={28} className="animate-bounce" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl text-neutral-900 dark:text-white">Leaderboard Imperial</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Classificação global dos concorrentes do Edurank</p>
          </div>
        </div>

        {/* Search input to look for users */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
            <Search size={14} />
          </span>
          <input 
            type="text" 
            placeholder="Procurar concorrente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-neutral-500">
          <Trophy className="mx-auto animate-spin text-yellow-500 mb-2" size={36} />
          <p className="text-xs font-semibold">Calculando classificações globais...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-orange-55 border border-orange-200 text-orange-850 rounded-xl text-xs font-semibold">
          {error}
        </div>
      ) : filteredRanking.length === 0 ? (
        <div className="text-center bg-white dark:bg-neutral-800 py-16 px-4 rounded-xl border border-neutral-150 dark:border-neutral-700/80 text-neutral-400">
          <Medal size={40} className="mx-auto text-neutral-300 mb-1" />
          <p className="text-xs font-semibold">Nenhum competidor encontrado.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-150 dark:border-neutral-700/80 shadow-md overflow-hidden transition-all text-left">
          
          <div className="overflow-x-auto">
            <table id="leaderboard-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-black tracking-widest border-b border-neutral-100 dark:border-neutral-750">
                  <th className="py-3 px-5 text-center w-16">Rank</th>
                  <th className="py-3 px-4">Estudante</th>
                  <th className="py-3 px-4 text-center">Nível Alcançado</th>
                  <th className="py-3 px-4 text-center">Quizzes Feitos</th>
                  <th className="py-3 px-5 text-right">XP Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-750">
                {filteredRanking.map((competitor, idx) => {
                  const position = idx + 1;
                  
                  // Medals for top 3 positions
                  let medalDisplay: React.ReactNode | null = null;
                  let rankStyle = "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";
                  
                  if (position === 1) {
                    medalDisplay = <Medal className="text-yellow-500 shrink-0" size={17} />;
                    rankStyle = "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 font-extrabold";
                  } else if (position === 2) {
                    medalDisplay = <Medal className="text-slate-400 shrink-0" size={17} />;
                    rankStyle = "bg-slate-100 text-slate-800 dark:bg-slate-900/60 dark:text-slate-350 font-semibold";
                  } else if (position === 3) {
                    medalDisplay = <Medal className="text-amber-600 shrink-0" size={17} />;
                    rankStyle = "bg-amber-100 text-amber-900 dark:bg-amber-950/30 dark:text-amber-500 font-semibold";
                  }

                  // Fallback letter avatar if image is empty
                  const initials = competitor.name ? competitor.name[0].toUpperCase() : '?';

                  // Dynamic Badge according to Level system
                  let levelBadgeStyle = "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300";
                  if (competitor.levelName === 'Aprendiz') {
                    levelBadgeStyle = "bg-blue-50 text-blue-700 dark:bg-blue-900/15 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30";
                  } else if (competitor.levelName === 'Desbravador') {
                    levelBadgeStyle = "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/15 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";
                  } else if (competitor.levelName === 'Mentor') {
                    levelBadgeStyle = "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/15 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30";
                  } else if (competitor.levelName === 'Mestre') {
                    levelBadgeStyle = "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/25 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/40 font-extrabold";
                  }

                  return (
                    <tr 
                      key={competitor.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-all text-sm group"
                    >
                      {/* Rank Position */}
                      <td className="py-4 px-5 text-center font-bold font-mono">
                        <div className="flex items-center justify-center gap-1">
                          {medalDisplay}
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${rankStyle}`}>
                            {position}
                          </span>
                        </div>
                      </td>

                      {/* Profile info with Avatar upload rendering */}
                      <td className="py-4 px-4 font-medium text-neutral-950 dark:text-white">
                        <div className="flex items-center gap-3">
                          {competitor.avatar ? (
                            <img 
                              src={competitor.avatar} 
                              alt={`Avatar de ${competitor.name}`}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-extrabold flex items-center justify-center text-sm border border-neutral-200 dark:border-neutral-750">
                              {initials}
                            </div>
                          )}
                          <div>
                            <span className="block font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                              {competitor.name}
                            </span>
                            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-normal">
                              {competitor.role === 'ADMIN' ? '🛡️ Moderador / Admin' : '🎓 Competidor'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Display Level Name instead of level index */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold py-0.5 px-2.5 rounded-full uppercase tracking-wider ${levelBadgeStyle}`}>
                          {competitor.levelName === 'Mestre' && <Star size={10} className="fill-current text-yellow-500 animate-spin-slow" />}
                          {competitor.levelName}
                        </span>
                      </td>

                      {/* Metric quizzes */}
                      <td className="py-4 px-4 text-center font-semibold font-mono text-neutral-600 dark:text-neutral-400">
                        {competitor.completedQuizzesCount}
                      </td>

                      {/* Total score points */}
                      <td className="py-4 px-5 text-right font-black font-display text-base text-neutral-900 dark:text-white">
                        <span className="text-blue-600 dark:text-blue-400 group-hover:drop-shadow-sm transition-all">
                          {competitor.points} <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">XP</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
