import { useState, useEffect } from 'react';
import { api } from './services/api.js';
import { User } from './types.js';
import LoginRegister from './pages/LoginRegister.js';
import Dashboard from './pages/Dashboard.js';
import Quizzes from './pages/Quizzes.js';
import Leaderboard from './pages/Leaderboard.js';
import Profile from './pages/Profile.js';
import AdminModeration from './pages/AdminModeration.js';
import { 
  Sun, Moon, LogOut, Award, BookOpen, Trophy, User as UserIcon, Shield, Sparkles, GraduationCap 
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('edurank_token'));
  const [activeTab, setActiveTab] = useState<'study' | 'quizzes' | 'leaderboard' | 'profile' | 'admin'>('study');
  
  // Dark/Light State management
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('edurank_theme');
    return saved ? saved === 'dark' : true; // Default to eye-safe Dark Mode as a creative modern baseline
  });

  const [loading, setLoading] = useState(true);

  // Apply visual theme class to HTML node
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('edurank_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('edurank_theme', 'light');
    }
  }, [isDark]);

  // Handle active session on refresh
  useEffect(() => {
    if (token) {
      fetchSessionProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchSessionProfile = async () => {
    try {
      const activeUser = await api.getProfile();
      setUser(activeUser);
    } catch (err: any) {
      console.warn('Authentication token expired or banned on refresh:', err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (authenticatedUser: User, receivedToken: string) => {
    setToken(receivedToken);
    setUser(authenticatedUser);
    setActiveTab('study');
  };

  const handleLogout = () => {
    localStorage.removeItem('edurank_token');
    setToken(null);
    setUser(null);
  };

  const handleRefreshUser = () => {
    fetchSessionProfile();
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center font-sans">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-900/40 rounded-full text-blue-405 animate-pulse mb-1 border border-blue-900/50">
            <GraduationCap size={32} />
          </div>
          <h2 className="font-display font-black tracking-widest text-lg text-neutral-300">EDURANK</h2>
          <div className="flex justify-center items-center gap-1 text-xs text-neutral-500 font-bold">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
            Carregando sua jornada...
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated? Show register auth drawer
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-[#E2E8F0] flex flex-col justify-between transition-all">
        {/* Simple Header */}
        <header id="landing-header" className="border-b border-slate-800/40 bg-[#0F0F12]/95 backdrop-blur-sm p-4 w-full">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black font-display text-sm tracking-tight shadow-[0_0_10px_rgba(245,158,11,0.2)] shrink-0">
                E
              </div>
              <span className="font-display font-black text-sm tracking-widest text-white">EDURANK</span>
            </div>
            {/* Theme switcher */}
            <button 
              id="theme-tog-landing" 
              onClick={toggleTheme}
              className="p-2 rounded-full cursor-pointer hover:bg-[#15151A] text-neutral-400 hover:text-amber-500 transition-colors"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="grow flex items-center justify-center">
          <LoginRegister onLoginSuccess={handleLoginSuccess} />
        </main>

        {/* Humble corporate footer info */}
        <footer className="text-center py-6 text-xs text-neutral-500 font-medium border-t border-slate-800/30 bg-[#0F0F12]">
          Edurank Gaming © {new Date().getFullYear()} — Cultivando Conhecimentos e Progressos.
        </footer>
      </div>
    );
  }

  // Initials for avatar fallback
  const initials = user.name ? user.name[0].toUpperCase() : '?';

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E2E8F0] font-sans flex flex-col justify-between">
      
      {/* Master Interactive Header Navigation */}
      <header id="main-navigation-bar" className="sticky top-0 bg-[#0F0F12]/95 backdrop-blur-md border-b border-slate-800/40 p-3.5 z-40 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.3)] leading-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center px-4">
          
          {/* Logo Brand with active Badge description */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black font-display text-base shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
              E
            </div>
            <div className="text-left leading-none space-y-0.5">
              <span className="font-display font-black text-sm tracking-wide block text-white">EDURANK</span>
              <span className="text-[10px] text-amber-500 font-bold block uppercase tracking-widest">Arena de Estudo</span>
            </div>
          </div>

          {/* Tab triggers for pages route emulation */}
          <nav className="flex items-center gap-1.5 text-xs">
            <button
              id="nav-tab-study"
              onClick={() => setActiveTab('study')}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'study'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold'
                  : 'text-neutral-400 hover:text-amber-500'
              }`}
            >
              <BookOpen size={13} /> Estudo
            </button>
            
            <button
              id="nav-tab-quizzes"
              onClick={() => setActiveTab('quizzes')}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'quizzes'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold'
                  : 'text-neutral-400 hover:text-amber-500'
              }`}
            >
              <Award size={13} /> Quizzes
            </button>

            <button
              id="nav-tab-leaderboard"
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold'
                  : 'text-neutral-400 hover:text-amber-500'
              }`}
            >
              <Trophy size={13} /> Ranking
            </button>

            <button
              id="nav-tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold'
                  : 'text-neutral-400 hover:text-amber-500'
              }`}
            >
              <UserIcon size={13} /> Perfil
            </button>

            {/* Guarded Admin moderators tab */}
            {user.role === 'ADMIN' && (
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg font-semibold border transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-red-500/10 text-red-500 border-red-500/20 font-bold'
                    : 'text-red-500/60 hover:text-red-400'
                }`}
              >
                <Shield size={13} /> Moderar
              </button>
            )}
          </nav>

          {/* Right Tools: Avatar Chip, XP Tracker, Theme trigger & exit */}
          <div className="flex items-center gap-3">
            
            {/* Gamification Level badge & Avatar photo representation */}
            <div className="hidden md:flex items-center gap-2.5 bg-[#15151A] py-1.5 pl-2.5 pr-3.5 rounded-full border border-slate-800/40">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover shadow-sm shrink-0 border border-slate-700"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-amber-500/20">
                  {initials}
                </div>
              )}
              
              <div className="text-left leading-none space-y-0.5">
                <span className="text-[10px] text-neutral-500 uppercase font-black tracking-wider block">XP Global</span>
                <span className="text-xs font-black block text-neutral-200 tracking-tight">
                  {user.points} XP <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider ml-1">({user.levelName})</span>
                </span>
              </div>
            </div>

            {/* Theme switcher */}
            <button 
              id="theme-trigger-active" 
              onClick={toggleTheme}
              className="p-2 rounded-full cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Trocar Aparência"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Logout button */}
            <button 
              id="logout-trigger"
              onClick={handleLogout}
              className="p-2 rounded-full cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-500 hover:text-red-500 transition-all"
              title="Encerrar Sessão"
            >
              <LogOut size={17} />
            </button>

          </div>

        </div>
      </header>

      {/* Pages Container Body */}
      <main className="grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 shrink-0 min-h-[70vh]">
        {activeTab === 'study' && (
          <Dashboard 
            user={user} 
            onRefreshUser={handleRefreshUser} 
            onGoToQuizzes={() => setActiveTab('quizzes')} 
          />
        )}
        {activeTab === 'quizzes' && (
          <Quizzes 
            user={user} 
            onRefreshUser={handleRefreshUser} 
          />
        )}
        {activeTab === 'leaderboard' && (
          <Leaderboard />
        )}
        {activeTab === 'profile' && (
          <Profile 
            user={user} 
            onRefreshUser={handleRefreshUser} 
          />
        )}
        {activeTab === 'admin' && user.role === 'ADMIN' && (
          <AdminModeration 
            currentUser={user} 
          />
        )}
      </main>

      {/* Corporate footer info */}
      <footer className="border-t border-neutral-150 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 py-6 text-center text-xs text-neutral-400 dark:text-neutral-500 font-medium">
        Edurank Global System • Criado com React e Tailwind CSS • {new Date().getFullYear()}
      </footer>

    </div>
  );
}
