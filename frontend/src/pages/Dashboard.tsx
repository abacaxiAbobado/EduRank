import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { EducationalContent, User } from '../types.js';
import { 
  BookOpen, Plus, Tag, Search, FileText, Calendar, Edit3, Trash2, 
  ChevronRight, Sparkles, GraduationCap, Link
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onRefreshUser: () => void;
  onGoToQuizzes: () => void;
}

export default function Dashboard({ user, onRefreshUser, onGoToQuizzes }: DashboardProps) {
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Creative publishing state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<EducationalContent | null>(null);
  
  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAttachedFiles, setFormAttachedFiles] = useState<{ name: string; url: string }[]>([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const data = await api.getContents();
      setContents(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar materiais educacionais.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingContent(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('Programação');
    setFormTags('');
    setFormImageUrl('');
    setFormAttachedFiles([]);
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (article: EducationalContent) => {
    setEditingContent(article);
    setFormTitle(article.title);
    setFormContent(article.content || ''); // Load raw content for edit
    setFormCategory(article.category);
    setFormTags(article.tags.join(', '));
    setFormImageUrl(article.imageUrl || '');
    setFormAttachedFiles(article.attachedFiles || []);
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleAddFile = () => {
    if (!newFileName || !newFileUrl) {
      setFormError('Informe o nome e link do anexo.');
      return;
    }
    // Simple link checking
    if (!/^https?:\/\//i.test(newFileUrl)) {
      setFormError('O link do anexo deve iniciar com http:// ou https://');
      return;
    }
    setFormAttachedFiles([...formAttachedFiles, { name: newFileName.trim(), url: newFileUrl.trim() }]);
    setNewFileName('');
    setNewFileUrl('');
    setFormError(null);
  };

  const handleRemoveFile = (index: number) => {
    setFormAttachedFiles(formAttachedFiles.filter((_, i) => i !== index));
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    if (!formTitle.trim() || !formContent.trim() || !formCategory.trim()) {
      setFormError('Título, conteúdo e categoria são de preenchimento obrigatório.');
      setFormLoading(false);
      return;
    }

    const tagsArray = formTags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      if (editingContent) {
        // Edit flow
        await api.editContent(editingContent.id, {
          title: formTitle,
          content: formContent,
          category: formCategory,
          tags: tagsArray,
          imageUrl: formImageUrl || null,
          attachedFiles: formAttachedFiles
        });
      } else {
        // Create flow
        await api.createContent({
          title: formTitle,
          content: formContent,
          category: formCategory,
          tags: tagsArray,
          imageUrl: formImageUrl || null,
          attachedFiles: formAttachedFiles
        });
      }

      setIsEditorOpen(false);
      fetchContents();
      onRefreshUser(); // Refresh count if user created content
    } catch (err: any) {
      setFormError(err.message || 'Erro ao processar alteração.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este material didático?')) return;
    try {
      await api.deleteContent(id);
      fetchContents();
    } catch (err: any) {
      alert(err.message || 'Falha ao remover material.');
    }
  };

  const categories = ['todos', ...new Set(contents.map(c => c.category))];
  
  const filteredContents = contents.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.rawContent.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Dynamic Profile & Gamification Stats Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-neutral-800 dark:to-neutral-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-transparent dark:border-neutral-700/60 transition-all">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          Olá, {user.name}! 🚀
        </h1>
        <p className="text-blue-100 dark:text-neutral-400 text-sm max-w-2xl font-medium">
          Seja bem-vindo ao Edurank. Leia materiais de estudo atualizados, responda quizzes exclusivos e suba o nível global!
        </p>

        {/* Gamification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/10 dark:border-neutral-700/60">
          
          {/* Level Progress Slider */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold flex items-center gap-1.5 text-blue-50 dark:text-neutral-300">
                <Sparkles size={16} className="text-yellow-400" />
                Seu Nível: <span className="text-yellow-300 font-extrabold text-base tracking-wide uppercase">{user.levelName}</span>
              </span>
              <span className="text-xs text-blue-100 dark:text-neutral-400 font-bold whitespace-nowrap">
                {user.points} / 1000 XP
              </span>
            </div>
            
            <div className="w-full h-3.5 bg-white/20 dark:bg-neutral-950 rounded-full overflow-hidden shadow-inner flex border border-white/10 dark:border-neutral-800">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-400 font-black rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${Math.min(100, (user.points / 1000) * 100)}%` }}
              />
            </div>

            <div className="text-[11px] text-blue-100 dark:text-neutral-500 mt-1 flex justify-between">
              <span>Nível 1: Aprendiz</span>
              <span>Nível 2: Desbravador</span>
              <span>Nível 3: Mentor</span>
              <span>Nível 4: Mestre</span>
            </div>
          </div>

          {/* Completed Quizzes Metric Badge */}
          <div className="bg-white/10 dark:bg-neutral-950/40 p-4 rounded-xl border border-white/5 dark:border-neutral-850 flex items-center justify-between shadow-inner">
            <div className="space-y-0.5">
              <span className="text-xs text-blue-100 dark:text-neutral-400 uppercase font-bold tracking-wider block">Quizzes Concluídos</span>
              <span className="text-2xl font-black font-display text-white">{user.completedQuizzesCount}</span>
            </div>
            <div className="p-3 bg-white/15 dark:bg-neutral-800 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
          </div>

        </div>
      </div>

      {/* Main Educational Catalog Area */}
      <div className="space-y-6">
        
        {/* Hub Controls Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700/80 shadow-sm transition-all">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg text-blue-600 dark:text-blue-400">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-neutral-900 dark:text-white">Estudos Guiados</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Explore materiais educacionais didáticos</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative shrink w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 pointer-events-none">
                <Search size={16} />
              </span>
              <input 
                type="text" 
                placeholder="Buscar conteúdo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Create content triggers (admins or all users can write their content) */}
            <button
              id="btn-create-content"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 text-xs py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus size={14} /> Novo Artigo
            </button>
          </div>
        </div>

        {/* Category Filters row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-950 dark:border-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 border-neutral-100 dark:border-neutral-700/80'
              }`}
            >
              {cat === 'todos' ? '🌐 Todos' : cat}
            </button>
          ))}
        </div>

        {/* Content Listing Grid */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">
            <BookOpen className="mx-auto mb-3 animate-spin text-neutral-400" size={32} />
            <p className="text-sm font-medium">Carregando conteúdos didáticos...</p>
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center bg-white dark:bg-neutral-800 py-16 px-4 rounded-xl border border-neutral-100 dark:border-neutral-700/80 text-neutral-400 dark:text-neutral-500 shadow-sm transition-all">
            <FileText className="mx-auto mb-3" size={40} />
            <p className="text-sm font-medium">Nenhum conteúdo educacional foi encontrado.</p>
            <p className="text-xs max-w-sm mx-auto mt-1 leading-relaxed">
              Tente alterar os termos da busca ou clique em 'Novo Artigo' para redigir o primeiro material!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContents.map((article) => {
              const canEdit = user.role === 'ADMIN' || article.authorId === user.id;
              
              return (
                <div 
                  key={article.id}
                  className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-md dark:shadow-none transition-all group duration-300"
                >
                  <div className="space-y-4">
                    {/* Header and Controls */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 py-0.5 px-2 bg-blue-50 dark:bg-blue-900/10 rounded">
                          <Tag size={10} /> {article.category}
                        </span>
                        <h3 className="font-display font-extrabold text-lg text-neutral-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {article.title}
                        </h3>
                      </div>

                      {/* Management Edit buttons (creators or admins) */}
                      {canEdit && (
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(article)}
                            className="p-1 px-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-500 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-xs flex items-center gap-1 text-[11px]"
                            title="Editar Artigo"
                          >
                            <Edit3 size={13} /> Editar
                          </button>
                          
                          {/* Admin or content creator can delete */}
                          <button
                            onClick={() => handleDeleteContent(article.id)}
                            className="p-1 px-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-neutral-400 hover:text-red-500 cursor-pointer text-xs flex items-center gap-1 text-[11px]"
                            title="Excluir Artigo"
                          >
                            <Trash2 size={13} /> Excluir
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Render HTML content with clickable safe anchors mapped from Backend Sanitizer */}
                    <div 
                      className="text-neutral-600 dark:text-neutral-300 text-sm line-clamp-5 leading-relaxed markdown-body overflow-hidden break-words text-left"
                      dangerouslySetInnerHTML={{ __html: article.htmlContent }}
                    />
                  </div>

                  <div className="pt-5 border-t border-neutral-50 dark:border-neutral-700/50 mt-5 flex flex-wrap gap-3 items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
                    <div className="flex items-center gap-3">
                      <span>Autor: <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{article.authorName}</strong></span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>

                    {/* Linked Files attachments */}
                    {article.attachedFiles && article.attachedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {article.attachedFiles.map((file, fIdx) => (
                          <a 
                            key={fIdx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium bg-neutral-100 dark:bg-neutral-700/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 py-1 px-2.5 rounded border border-neutral-200/50 dark:border-neutral-600/30 transition-all cursor-pointer"
                          >
                            <FileText size={10} /> {file.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Embedded Complete In-Place Educational Content Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-neutral-100 dark:border-neutral-700 shadow-2xl transition-all text-left">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100 dark:border-neutral-700">
              <h3 className="font-display font-extrabold text-xl text-neutral-950 dark:text-white">
                {editingContent ? 'Editar Artigo Educacional' : 'Publicar Novo Artigo'}
              </h3>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveContent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5" htmlFor="art-title">Título do Artigo</label>
                <input 
                  id="art-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white"
                  placeholder="Ex: CSS Grid vs Flexbox: Quando usar cada um?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5" htmlFor="art-category">Categoria</label>
                  <select 
                    id="art-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm text-neutral-950 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Programação">💻 Programação</option>
                    <option value="Ciências Naturais">🌱 Ciências Naturais</option>
                    <option value="Matemática">📐 Matemática</option>
                    <option value="Ciências Humanas">🌍 Ciências Humanas</option>
                    <option value="Idiómas">🗣️ Idiomas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5" htmlFor="art-tags">Tags (separadas por vírgula)</label>
                  <input 
                    id="art-tags"
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="HTML, SEO, Metodologia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5" htmlFor="art-content">Conteúdo Textual (Qualquer link puro inserido será mapeado em link seguro!)</label>
                <textarea 
                  id="art-content"
                  rows={8}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 text-neutral-900 dark:text-white placeholder-neutral-400"
                  placeholder="Redija o texto educacional aqui... Cole links diretos como https://google.com para convertê-los automaticamente."
                />
              </div>

              {/* Attachments Section */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-150 dark:border-neutral-750 space-y-3.5">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                  <Link size={13} /> Arquivos e Links Anexados
                </span>
                
                {formAttachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formAttachedFiles.map((file, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 py-1 px-2 rounded">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700 ml-1 cursor-pointer font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    placeholder="Nome do Anexo (ex: Gabarito Extra)"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Link do Anexo (https://...)"
                    value={newFileUrl}
                    onChange={(e) => setNewFileUrl(e.target.value)}
                    className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white"
                  />
                  <button 
                    type="button"
                    onClick={handleAddFile}
                    className="px-3.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 text-xs font-semibold rounded-lg shrink-0 cursor-pointer transition-all"
                  >
                    Anexar
                  </button>
                </div>
              </div>

              {/* Form submit/cancel */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-150 dark:border-neutral-750">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-205 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-art"
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Salvando...' : 'Salvar e Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
