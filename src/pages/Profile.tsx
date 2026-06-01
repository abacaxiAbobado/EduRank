import React, { useState } from 'react';
import { api } from '../services/api.js';
import { User } from '../types.js';
import { 
  User as UserIcon, Camera, Trash2, Mail, Save, BadgeCheck, Shield, HelpCircle 
} from 'lucide-react';

interface ProfileProps {
  user: User;
  onRefreshUser: () => void;
}

export default function Profile({ user, onRefreshUser }: ProfileProps) {
  const [name, setName] = useState(user.name);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File Selector handler with constraints
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (2MB)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      setError('O tamanho da foto excede o limite máximo permitido de 2MB.');
      return;
    }

    // Check supported types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato não suportado. Carregue apenas arquivos JPG, PNG ou WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarBase64(base64String);
      setAvatarPreview(base64String);
      setRemoveAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarBase64(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!name.trim()) {
      setError('O nome não pode estar em branco.');
      setLoading(false);
      return;
    }

    try {
      // Trigger API profile updates
      const res = await api.updateProfile(
        name,
        avatarBase64, // could be null if no change
        removeAvatar // boolean flag to erase
      );
      
      setMessage(res.message);
      onRefreshUser(); // dynamic update parent header chip
      setAvatarBase64(null); // Reset base64 cache since it is saved
      setRemoveAvatar(false);
    } catch (err: any) {
      setError(err.message || 'Falha ao processar alterações de perfil.');
    } finally {
      setLoading(false);
    }
  };

  // Initials for avatar fallback
  const initials = user.name ? user.name[0].toUpperCase() : '?';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-left">
      
      {/* Title Header */}
      <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-neutral-150 dark:border-neutral-700/80 shadow-sm transition-all">
        <h2 className="font-display font-black text-xl text-neutral-900 dark:text-white">Seu Histórico e Configurações</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Ajuste seu nome de exibição, foto de avatar e acompanhe seu progresso</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card & Avatar Selection */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-150 dark:border-neutral-700/80 p-5 flex flex-col items-center justify-center text-center shadow-sm relative transition-all">
          <div className="relative group">
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Avatar Preview" 
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full object-cover border-2 border-indigo-600 shadow-md transition-transform"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-extrabold text-3xl flex items-center justify-center border-2 border-indigo-600/30">
                {initials}
              </div>
            )}

            {/* Custom overlay camera selector */}
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 hover:scale-105 text-white rounded-full cursor-pointer shadow-lg transition-all"
              title="Carregar nova foto"
            >
              <Camera size={14} />
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" 
              />
            </label>
          </div>

          <h3 className="font-display font-black text-neutral-900 dark:text-white text-base mt-4 block">
            {user.name}
          </h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-wider mt-0.5">
            {user.levelName}
          </p>

          {/* Delete Avatar if already exists */}
          {(avatarPreview || avatarBase64) && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="mt-4 flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 hover:underline p-1.5 focus:outline-none cursor-pointer"
            >
              <Trash2 size={11} /> Remover Foto de Perfil
            </button>
          )}

          <div className="w-full border-t border-neutral-50 dark:border-neutral-700/60 mt-5 pt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Progresso global:</span>
              <strong className="text-neutral-800 dark:text-neutral-300 font-black">{user.points} XP</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Patente Ativa:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{user.levelName}</span>
            </div>
          </div>
        </div>

        {/* Change form */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-150 dark:border-neutral-700/80 p-6 shadow-sm transition-all space-y-4">
          <h3 className="font-display font-bold text-sm text-neutral-700 dark:text-neutral-300 border-b border-neutral-100 dark:border-neutral-700/85 pb-2 uppercase tracking-wider">
            Informações Pessoais
          </h3>

          {message && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-750 dark:text-red-300 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="profile-form">
            <div>
              <label className="block text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2" htmlFor="prof-name">
                Nome de Exibição
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <UserIcon size={16} />
                </span>
                <input 
                  id="prof-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                  placeholder="Seu nome exibido nos rankings"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2" htmlFor="prof-email">
                Endereço de E-mail (Somente Leitura)
              </label>
              <div className="relative opacity-65 cursor-not-allowed">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail size={16} />
                </span>
                <input 
                  id="prof-email"
                  type="email"
                  readOnly
                  value={user.email}
                  className="block w-full pl-9 pr-3 py-2 border border-neutral-100 dark:border-neutral-750 rounded-lg bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-500 text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700/50 mt-4 flex justify-between items-center">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                Aceita formatos JPG, PNG e WEBP até um limite total de 2MB.
              </span>
              <button
                id="btn-save-profile"
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save size={14} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
}
