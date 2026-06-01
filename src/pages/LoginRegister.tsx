import React, { useState } from 'react';
import { api } from '../services/api.js';
import { User as UserIcon, Mail, Lock, ShieldAlert, GraduationCap } from 'lucide-react';
import { User } from '../types.js';

interface LoginRegisterProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function LoginRegister({ onLoginSuccess }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Suspension information tracking
  const [suspensionData, setSuspensionData] = useState<{
    reason: string;
    endsAt: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuspensionData(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Authenticate
        const response = await api.login(email, password);
        localStorage.setItem('edurank_token', response.token);
        onLoginSuccess(response.user, response.token);
      } else {
        // Validation check
        if (!name.trim()) {
          throw new Error('Por favor, informe seu nome completo.');
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error('Por favor, informe um endereço de e-mail válido.');
        }
        if (password.length < 6) {
          throw new Error('A senha deve conter pelo menos 6 caracteres.');
        }

        const response = await api.register(name, email, password);
        localStorage.setItem('edurank_token', response.token);
        onLoginSuccess(response.user, response.token);
      }
    } catch (err: any) {
      if (err.suspended) {
        setSuspensionData({
          reason: err.reason || 'Nenhuma justificativa provida.',
          endsAt: err.endsAt || 'Permanente',
          message: err.message
        });
      } else {
        setError(err.message || 'Falha na autenticação. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, pass: string) => {
    setEmail(demoEmail);
    setPassword(pass);
    setError(null);
    setSuspensionData(null);
    setLoading(true);
    try {
      const response = await api.login(demoEmail, pass);
      localStorage.setItem('edurank_token', response.token);
      onLoginSuccess(response.user, response.token);
    } catch (err: any) {
      if (err.suspended) {
        setSuspensionData({
          reason: err.reason || 'Motivo ocultado',
          endsAt: err.endsAt || 'Permanente',
          message: err.message
        });
      } else {
        setError(err.message || 'Falha no login demonstrativo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-700/80 transition-all">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <GraduationCap size={36} className="animate-pulse" />
          </div>
          <h2 className="font-display text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            EDURANK
          </h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Aprenda, dispute no ranking e domine quizzes educacionais
          </p>
        </div>

        {/* Account Suspended Block */}
        {suspensionData && (
          <div className="p-5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200 space-y-3 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={22} className="shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 dark:text-red-300">Acesso Restrito</h3>
                <p className="text-sm mt-1">{suspensionData.message}</p>
              </div>
            </div>
            <div className="text-xs bg-white/40 dark:bg-neutral-900/40 p-3 rounded-lg space-y-1.5 border border-red-200/50 dark:border-red-900/40">
              <div>
                <span className="font-semibold text-red-900 dark:text-red-400">Motivo:</span> {suspensionData.reason}
              </div>
              <div>
                <span className="font-semibold text-red-900 dark:text-red-400">Expira em:</span>{' '}
                {suspensionData.endsAt === 'Permanente'
                  ? 'Bloqueio Permanente'
                  : new Date(suspensionData.endsAt).toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 text-orange-800 dark:text-orange-300 text-sm font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Submission form */}
        {!suspensionData && (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit} id="auth-form">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2" htmlFor="name-input">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <UserIcon size={18} />
                  </div>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                    placeholder="Ex: Carlos Albuquerque"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2" htmlFor="email-input">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  placeholder="Ex: voce@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2" htmlFor="password-input">
                Senha {!isLogin && <span className="text-neutral-400 font-normal hover:text-neutral-300">(Min. 6 caracteres)</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  placeholder="Sua senha secreta"
                />
              </div>
            </div>

            <button
              id="auth-submit-button"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {loading ? 'Processando...' : isLogin ? 'Acessar Edurank' : 'Concluir Cadastro'}
            </button>
          </form>
        )}

        {/* Toggle Form type link */}
        {!suspensionData && (
          <div className="text-center mt-4">
            <button
              id="auth-toggle-link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {isLogin ? 'Não possui uma conta? Cadastre-se' : 'Já possui uma conta? Faça Login'}
            </button>
          </div>
        )}

        {/* Demo Credentials Drawer */}
        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-700/60 mt-6 text-center">
          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold block mb-3 uppercase tracking-wider">
            Acesso Rápido de Testes
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-user-btn"
              onClick={() => handleDemoLogin('comum@edurank.com', 'comum123')}
              className="text-xs bg-neutral-100 dark:bg-neutral-700/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 py-2 px-3 rounded-lg border border-neutral-200/50 dark:border-neutral-600/30 font-medium transition-all cursor-pointer"
            >
              🧑 Estudante
            </button>
            <button
              id="demo-admin-btn"
              onClick={() => handleDemoLogin('admin@edurank.com', 'admin123')}
              className="text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 py-2 px-3 rounded-lg border border-blue-100 dark:border-blue-900/40 font-semibold transition-all cursor-pointer"
            >
              🛡️ Administrador
            </button>
            <button
              id="demo-prof-btn"
              onClick={() => handleDemoLogin('professor@edurank.com', 'professor123')}
              className="text-xs bg-neutral-100 dark:bg-neutral-700/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 py-2 px-3 rounded-lg border border-neutral-200/50 dark:border-neutral-600/30 font-medium transition-all cursor-pointer col-span-2"
            >
              ✍️ Mentor / Criador
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
