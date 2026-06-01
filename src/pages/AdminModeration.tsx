import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { User, AdminLog } from '../types.js';
import { 
  Users, ShieldAlert, History, Calendar, ShieldCheck, Power, Ban, Info, AlertTriangle, Filter
} from 'lucide-react';

interface AdminModerationProps {
  currentUser: User;
}

export default function AdminModeration({ currentUser }: AdminModerationProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Suspension form setup
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [motive, setMotive] = useState('');
  const [duration, setDuration] = useState<'permanent' | 'temporary'>('temporary');
  const [endsAtDate, setEndsAtDate] = useState('');
  
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'users') {
        const data = await api.getAllUsers();
        setUsers(data);
      } else {
        const data = await api.getAdminLogs();
        setLogs(data);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar informações de auditoria administrativa.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSuspendModal = (user: User) => {
    if (user.id === currentUser.id) {
      alert('Operação negada. Um administrador não pode suspender o próprio acesso!');
      return;
    }
    setSelectedUser(user);
    setMotive('');
    setDuration('temporary');
    // Set default tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEndsAtDate(tomorrow.toISOString().substring(0, 16)); // Format YYYY-MM-DDTHH:MM for datetime-local
    setFormError(null);
    setFormMessage(null);
  };

  const handleUnsuspend = async (userId: string) => {
    if (!window.confirm('Deseja retirar a suspensão administrativa deste usuário agora?')) return;
    try {
      const res = await api.unsuspendUser(userId);
      alert(res.message);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Falha ao reativar usuário.');
    }
  };

  const handleSaveSuspension = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormMessage(null);
    setFormLoading(true);

    if (!motive.trim()) {
      setFormError('Escreva a justificativa para registrar a suspensão.');
      setFormLoading(false);
      return;
    }

    let endDate: string | null = null;
    if (duration === 'temporary') {
      if (!endsAtDate) {
        setFormError('Adicione um prazo final para a suspensão temporária.');
        setFormLoading(false);
        return;
      }
      const parsedDate = new Date(endsAtDate);
      if (parsedDate.getTime() < Date.now()) {
        setFormError('A data de término deve ser programada para o futuro.');
        setFormLoading(false);
        return;
      }
      endDate = parsedDate.toISOString();
    }

    try {
      const res = await api.suspendUser(selectedUser!.id, motive, endDate);
      setFormMessage(res.message);
      setSelectedUser(null);
      fetchAdminData();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar suspensão.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Title Header */}
      <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-neutral-150 dark:border-neutral-700/80 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all">
        <div>
          <h2 className="font-display font-black text-xl text-neutral-900 dark:text-white flex items-center gap-2">
            🛡️ Painel do Moderador
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Suspensão de competidores, exclusão de infrações e registros de auditoria</p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200/50 dark:border-neutral-800/60 grow sm:grow-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 text-xs py-1.5 px-3.5 rounded-md font-semibold cursor-pointer transition-all ${
              activeTab === 'users'
                ? 'bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Users size={14} /> Usuários
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 text-xs py-1.5 px-3.5 rounded-md font-semibold cursor-pointer transition-all ${
              activeTab === 'logs'
                ? 'bg-white text-neutral-900 dark:bg-neutral-800 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <History size={14} /> Auditoria / Logs
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neutral-400">
          <Power className="mx-auto animate-spin text-neutral-400 mb-2" size={32} />
          <p className="text-xs font-semibold">Consultando base corporativa...</p>
        </div>
      ) : activeTab === 'users' ? (
        // TABLE OF USERS WITH SUSPEND CONTROLS
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-150 dark:border-neutral-700/80 shadow-md overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="admin-users-table">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 text-[10px] text-neutral-400 dark:text-neutral-400 uppercase font-black tracking-wider border-b border-neutral-150 dark:border-neutral-750">
                  <th className="py-3.5 px-5">Estudante</th>
                  <th className="py-3.5 px-4">E-mail</th>
                  <th className="py-3.5 px-4 text-center">Patente</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right font-black">Moderação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700/60">
                {users.map((user) => {
                  const isMe = user.id === currentUser.id;
                  
                  return (
                    <tr key={user.id} className="hover:bg-neutral-50/40 dark:hover:bg-neutral-900/10 text-sm">
                      <td className="py-3.5 px-5 font-semibold text-neutral-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {isMe && <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 py-0.5 px-1.5 rounded font-black tracking-wide uppercase">Dono</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-550 dark:text-neutral-400 font-mono text-xs">{user.email}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-neutral-600 dark:text-neutral-300">{user.role}</td>
                      
                      {/* Active status or suspended badge */}
                      <td className="py-3.5 px-4 text-center">
                        {user.isSuspended ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-red-105 border border-red-200 text-red-800 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50 py-0.5 px-2.5 rounded-full font-bold uppercase tracking-wider">
                            <Ban size={10} /> Suspenso
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 border border-emerald-250 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 py-0.5 px-2.5 rounded-full font-bold uppercase tracking-wider">
                            <ShieldCheck size={10} /> Ativo
                          </span>
                        )}
                      </td>

                      {/* Suspension trigger button */}
                      <td className="py-3.5 px-5 text-right">
                        {isMe ? (
                          <span className="text-xs text-neutral-400 italic">Inviolável</span>
                        ) : user.isSuspended ? (
                          <button
                            onClick={() => handleUnsuspend(user.id)}
                            className="text-xs font-bold py-1 px-3 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 cursor-pointer transition-all"
                          >
                            Reativar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenSuspendModal(user)}
                            className="text-xs font-bold py-1 px-3 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400 cursor-pointer transition-all"
                          >
                            Suspender
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // ADMINISTRATIVE LOGS HISTORY
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-150 dark:border-neutral-700/80 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700/85 pb-2">
            <h3 className="font-display font-medium text-neutral-750 dark:text-neutral-300 text-sm uppercase tracking-wider">
              Registros Auditoriados de Segurança
            </h3>
            <span className="text-xs text-neutral-400">{logs.length} ações salvas</span>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <History size={36} className="mx-auto mb-1 text-neutral-300" />
              <p className="text-xs">Historico de ações vazio.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="bg-neutral-50 dark:bg-neutral-900/30 rounded-lg p-4 border border-neutral-200/60 dark:border-neutral-750 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
                >
                  <div className="space-y-1.5 text-left">
                    <span className="font-extrabold text-indigo-700 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-900/10 py-0.5 px-2 rounded block w-fit">
                      {log.action}
                    </span>
                    <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                      {log.details}
                    </p>
                    <div className="text-neutral-400 text-[10px]">
                      Autor: <strong className="text-neutral-500">{log.adminEmail}</strong>
                    </div>
                  </div>

                  <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1 bg-white dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-750 py-1 px-2.5 rounded shrink-0">
                    <Calendar size={10} /> {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complete Suspend form drawer */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-md p-6 sm:p-8 space-y-6 border border-neutral-100 dark:border-neutral-700 shadow-2xl text-left">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100 dark:border-neutral-700">
              <h3 className="font-display font-extrabold text-base sm:text-lg text-neutral-950 dark:text-white flex items-center gap-1.5">
                <AlertTriangle size={18} className="text-red-500 animate-pulse" />
                Suspender Acesso de Usuário
              </h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 p-3 rounded-lg text-yellow-800 dark:text-yellow-300 text-xs leading-relaxed">
              Você está prestes a bloquear o login do competidor <strong className="font-bold">{selectedUser.name}</strong> ({selectedUser.email}).
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-750 dark:text-red-350 rounded-lg text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveSuspension} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-1.5" htmlFor="susp-reason">Justificativa da Supensão</label>
                <textarea 
                  id="susp-reason"
                  rows={3}
                  required
                  value={motive}
                  onChange={(e) => setMotive(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Ex: Utilizou palavreado inadequado nos quizzes estudantis."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-1.5" htmlFor="susp-duration">Modalidade</label>
                <select 
                  id="susp-duration"
                  value={duration}
                  onChange={(e: any) => setDuration(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-950 dark:text-white"
                >
                  <option value="temporary">⏱️ Bloqueio Temporário</option>
                  <option value="permanent">🛡️ Bloqueio Permanente</option>
                </select>
              </div>

              {duration === 'temporary' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-1.5" htmlFor="susp-ends-date">Prazo Final</label>
                  <input 
                    id="susp-ends-date"
                    type="datetime-local"
                    required
                    value={endsAtDate}
                    onChange={(e) => setEndsAtDate(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-950 dark:text-white cursor-pointer"
                  />
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirm-suspend"
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Salvando...' : 'Aplicar Bloqueio'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
