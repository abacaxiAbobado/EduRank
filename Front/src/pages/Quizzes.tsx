import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Quiz, User } from '../types.js';
import { 
  Award, HelpCircle, ArrowRight, Play, Edit, Trash2, Plus, CornerDownRight,
  RotateCcw, Sparkles, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Check
} from 'lucide-react';

interface QuizzesProps {
  user: User;
  onRefreshUser: () => void;
}

export default function Quizzes({ user, onRefreshUser }: QuizzesProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active quiz playing states
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestions, setCurrentQuestions] = useState<any[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  
  // Quiz results states
  const [submitResults, setSubmitResults] = useState<any | null>(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  // Creative Editor states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  
  // Editor form parameters
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formQuestions, setFormQuestions] = useState<any[]>([
    { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' }
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await api.getQuizzes();
      setQuizzes(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar lista de quizzes.');
    } finally {
      setLoading(false);
    }
  };

  // Launch Play state
  const handleStartPlay = async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const fullQuiz = await api.getQuizById(quizId);
      setActiveQuiz(fullQuiz);
      setCurrentQuestions(fullQuiz.questions || []);
      setActiveQuestionIdx(0);
      setSelectedAnswers(new Array(fullQuiz.questions?.length || 0).fill(null));
      setSubmitResults(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIdx: number) => {
    const updated = [...selectedAnswers];
    updated[activeQuestionIdx] = optionIdx;
    setSelectedAnswers(updated);
  };

  const handleNextQuestion = () => {
    if (activeQuestionIdx < currentQuestions.length - 1) {
      setActiveQuestionIdx(activeQuestionIdx + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx(activeQuestionIdx - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (selectedAnswers.includes(null)) {
      if (!window.confirm('Você deixou perguntas sem responder. Enviar assim mesmo?')) return;
    }

    setSubmissionLoading(true);
    try {
      const results = await api.submitQuizAnswers(activeQuiz!.id, selectedAnswers);
      setSubmitResults(results);
      onRefreshUser(); // update points/levels dynamically
    } catch (err: any) {
      alert(err.message || 'Erro ao submeter respostas.');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleResetQuiz = () => {
    setActiveQuestionIdx(0);
    setSelectedAnswers(new Array(currentQuestions.length).fill(null));
    setSubmitResults(null);
  };

  const handleExitQuiz = () => {
    setActiveQuiz(null);
    setSubmitResults(null);
    setCurrentQuestions([]);
    fetchQuizzes();
  };

  // Editor Actions
  const handleOpenCreate = () => {
    setEditingQuiz(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Programação');
    setFormQuestions([
      { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' }
    ]);
    setFormError(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = async (quiz: Quiz) => {
    setLoading(true);
    setFormError(null);
    try {
      const fullQuiz = await api.getQuizById(quiz.id);
      setEditingQuiz(fullQuiz);
      setFormTitle(fullQuiz.title);
      setFormDescription(fullQuiz.description);
      setFormCategory(fullQuiz.category);
      setFormQuestions(fullQuiz.questions || []);
      setIsEditorOpen(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar detalhes para edição.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestionRow = () => {
    setFormQuestions([
      ...formQuestions,
      { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, explanation: '' }
    ]);
  };

  const handleRemoveQuestionRow = (idx: number) => {
    if (formQuestions.length <= 1) return;
    setFormQuestions(formQuestions.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, val: string) => {
    const updated = [...formQuestions];
    updated[idx].questionText = val;
    setFormQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...formQuestions];
    updated[qIdx].options[oIdx] = val;
    setFormQuestions(updated);
  };

  const handleCorrectIdxChange = (qIdx: number, val: number) => {
    const updated = [...formQuestions];
    updated[qIdx].correctAnswerIndex = val;
    setFormQuestions(updated);
  };

  const handleQuestionExplanationChange = (qIdx: number, val: string) => {
    const updated = [...formQuestions];
    updated[qIdx].explanation = val;
    setFormQuestions(updated);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    if (!formTitle.trim() || !formCategory.trim()) {
      setFormError('Título e Categoria são de preenchimento obrigatório.');
      setFormLoading(false);
      return;
    }

    // Validation checks inside questions
    for (let i = 0; i < formQuestions.length; i++) {
      const q = formQuestions[i];
      if (!q.questionText.trim()) {
        setFormError(`Por favor, preencha o enunciado da Pergunta ${i + 1}.`);
        setFormLoading(false);
        return;
      }
      if (q.options.some((o: string) => !o.trim())) {
        setFormError(`Preencha todas as alternativas de resposta da Pergunta ${i + 1}.`);
        setFormLoading(false);
        return;
      }
    }

    try {
      if (editingQuiz) {
        await api.editQuiz(editingQuiz.id, {
          title: formTitle,
          description: formDescription,
          category: formCategory,
          questions: formQuestions
        });
      } else {
        await api.createQuiz({
          title: formTitle,
          description: formDescription,
          category: formCategory,
          imageUrl: null,
          questions: formQuestions
        });
      }
      setIsEditorOpen(false);
      fetchQuizzes();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao processar as alterações.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!window.confirm('Excluir este quiz permanentemente?')) return;
    try {
      await api.deleteQuiz(id);
      fetchQuizzes();
    } catch (err: any) {
      alert(err.message || 'Falha ao remover quiz.');
    }
  };

  const categories = ['todos', ...new Set(quizzes.map(q => q.category))];

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || 
                          q.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Dynamic Screen routing: list quizzes or play active quiz */}
      {!activeQuiz ? (
        // STATE 1: List Quizzes
        <div className="space-y-6">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-150 dark:border-neutral-700/80 shadow-sm transition-all">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                <HelpCircle size={20} />
              </div>
              <div>
                <h2 className="font-display font-black text-lg text-neutral-900 dark:text-white">Arena de Quizzes</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Responda aos questionários e desafie seus limites</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative shrink w-full sm:w-56">
                <input 
                  type="text" 
                  placeholder="Procurar quiz..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-3 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Create triggered triggers */}
              <button
                id="btn-create-quiz"
                onClick={handleOpenCreate}
                className="flex items-center gap-1 text-xs py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer transition-all w-full sm:w-auto justify-center"
              >
                <Plus size={14} /> Novo Quiz
              </button>
            </div>
          </div>

          {/* Categories chips row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 navbar-scroll">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 border-neutral-100 dark:border-neutral-700/80'
                }`}
              >
                {cat === 'todos' ? '🥋 Todos' : cat}
              </button>
            ))}
          </div>

          {/* Quizzes list rendering */}
          {loading ? (
            <div className="text-center py-20 text-neutral-500">
              <HelpCircle className="mx-auto animate-spin text-indigo-400 mb-2" size={36} />
              <p className="text-xs font-semibold">Buscando questionários cadastrados...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center bg-white dark:bg-neutral-800 py-16 px-4 rounded-xl border border-neutral-150 dark:border-neutral-700/80 text-neutral-400 dark:text-neutral-500 shadow-sm">
              <HelpCircle size={40} className="mx-auto mb-2 text-neutral-300" />
              <p className="text-sm font-semibold">Tabela de quizzes vazia.</p>
              <p className="text-xs max-w-xs mx-auto mt-1">Inscreva o primeiro quiz clicando no botão 'Novo Quiz'!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => {
                const canEdit = user.role === 'ADMIN' || quiz.authorId === user.id;

                return (
                  <div 
                    key={quiz.id}
                    className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700/80 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group duration-300 text-left"
                  >
                    <div className="space-y-3.5">
                      {/* Badge category */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold px-2 py-0.5 rounded tracking-wide uppercase">
                          {quiz.category}
                        </span>
                        
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                          {quiz.questionsCount} Questões
                        </span>
                      </div>

                      <h3 className="font-display font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {quiz.title}
                      </h3>
                      
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                        {quiz.description || 'Nenhuma descrição provida para este quiz.'}
                      </p>
                    </div>

                    {/* Actions and details metadata footer */}
                    <div className="pt-4 border-t border-neutral-50 dark:border-neutral-700/50 mt-4 flex items-center justify-between text-xs">
                      {/* Author row (masked if author role is Admin) */}
                      <span className="text-neutral-400 dark:text-neutral-500">
                        Por: <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{quiz.authorName}</strong>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {canEdit && (
                          <div className="flex items-center gap-1 mr-1">
                            {/* Edit in place */}
                            <button
                              onClick={() => handleOpenEdit(quiz)}
                              className="p-1 px-1.5 text-[11px] rounded bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 text-neutral-600 dark:text-neutral-200 cursor-pointer flex items-center gap-1"
                              title="Editar"
                            >
                              <Edit size={12} /> Editar
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(quiz.id)}
                              className="p-1 px-1.5 text-[11px] rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-400 hover:text-red-500 cursor-pointer flex items-center gap-1"
                              title="Deletar"
                            >
                              <Trash2 size={12} /> Excluir
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => handleStartPlay(quiz.id)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                        >
                          Iniciar <Play size={10} className="fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        // STATE 2: Active Playing Mode (or showing score summary results)
        <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700/80 shadow-xl overflow-hidden transition-all text-left">
          
          {/* Header title block */}
          <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-150 dark:border-neutral-700/80 p-5 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider block mb-1">
                Você está respondendo a:
              </span>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-neutral-900 dark:text-white leading-tight">
                {activeQuiz.title}
              </h2>
            </div>
            
            <button 
              onClick={handleExitQuiz}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 py-1.5 px-3 bg-neutral-150 dark:bg-neutral-800 rounded-lg text-xs font-semibold hover:underline cursor-pointer transition-all"
            >
              Sair da Arena
            </button>
          </div>

          {/* Result view block */}
          {submitResults ? (
            <div className="p-6 sm:p-8 space-y-8 animate-fade-in text-left">
              
              {/* Score card banner */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-neutral-900/50 dark:to-neutral-900/50 rounded-2xl p-6 border border-indigo-100 dark:border-neutral-700/80 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2.5 text-center md:text-left">
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Análise do Desempenho
                  </span>
                  
                  <h3 className="font-display text-2xl font-extrabold text-neutral-900 dark:text-white">
                    Acertos: {submitResults.correctCount} / {submitResults.totalQuestions} ({submitResults.score}%)
                  </h3>
                  
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm max-w-md leading-relaxed">
                    Pontos são outorgados apenas para questões solucionadas corretamente por esta conta <strong className="text-neutral-700 dark:text-neutral-300">pela primeira vez</strong>. Quizzes podem ser repetidos livremente para fixação do conhecimento!
                  </p>
                </div>

                <div className="bg-indigo-650 text-white rounded-xl py-4 px-6 text-center shrink-0 shadow-lg border border-indigo-500/30 flex flex-col justify-center items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200 block mb-1">Pontos Ganhos</span>
                  <span className="text-4xl font-extrabold font-display leading-none text-yellow-300 flex items-center justify-center">
                    +{submitResults.pointsEarned} <span className="text-sm font-semibold ml-0.5 text-white/90">XP</span>
                  </span>
                </div>
              </div>

              {/* Duplicate Rule Alert block */}
              {submitResults.quizCompletedNowForFirstTime && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 p-4 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed flex gap-2">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <strong className="font-bold">Primeira Finalização Registrada!</strong> Você somou este quiz à sua contagem global de progressão, aproximando-se do próximo patamar de nível. Continue assim!
                  </div>
                </div>
              )}

              {/* Answers Breakdown / Explanation review list */}
              <div className="space-y-6">
                <h4 className="font-display font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-700 pb-2">
                  Revisão Detalhada das Questões
                </h4>

                <div className="space-y-5">
                  {submitResults.answersBreakdown.map((item: any, qIdx: number) => {
                    return (
                      <div 
                        key={item.questionId}
                        className="bg-neutral-50 dark:bg-neutral-900/30 rounded-xl p-5 border border-neutral-150 dark:border-neutral-750 text-left space-y-3.5"
                      >
                        <div className="flex items-start gap-2.5">
                          {item.isCorrect ? (
                            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                          ) : (
                            <XCircle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-1" />
                          )}
                          <div className="space-y-1">
                            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-bold block uppercase tracking-wider">
                              Questão {qIdx + 1}
                            </span>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm sm:text-base leading-snug">
                              {item.questionText}
                            </span>
                          </div>
                        </div>

                        {/* Options rendered showing correct index vs user indexing */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 pl-7">
                          {item.options.map((opt: string, oIdx: number) => {
                            const selected = item.selectedIndex === oIdx;
                            const correct = item.correctAnswerIndex === oIdx;
                            
                            let style = "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700";
                            if (correct) {
                              style = "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80 font-semibold";
                            } else if (selected && !correct) {
                              style = "bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300 border-red-300 dark:border-red-900/40";
                            }

                            return (
                              <div 
                                key={oIdx}
                                className={`p-2.5 border text-xs rounded-lg flex items-center justify-between ${style}`}
                              >
                                <span>{opt}</span>
                                {correct && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Gabarito</span>}
                                {selected && !correct && <span className="text-[10px] font-bold text-red-600 uppercase">Sua Escolha</span>}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanatory feedback */}
                        <div className="pl-7 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/50 space-y-1">
                          <div className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 flex items-center gap-1">
                            <CornerDownRight size={12} className="shrink-0" /> Explicação do Autor
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed italic bg-neutral-100 dark:bg-neutral-800 rounded p-2.5 border border-neutral-150 dark:border-neutral-750">
                            {item.explanation || 'Nenhuma justificativa provida para esta questão.'}
                          </p>
                          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                            Status de pontos: {item.alreadyCorrect ? '0 pontos adicionais (Questão já solucionada anteriormente nesta conta).' : item.isCorrect ? 'Pontuação Computada com sucesso!' : 'Opção incorreta.'}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-5 border-t border-neutral-150 dark:border-neutral-750">
                <button
                  onClick={handleResetQuiz}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-neutral-200 dark:border-neutral-600/35"
                >
                  <RotateCcw size={13} /> Refazer Quiz
                </button>
                <button
                  onClick={handleExitQuiz}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-sm"
                >
                  Voltar para os Quizzes
                </button>
              </div>

            </div>
          ) : (
            // Active quiz interaction/questions page
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* question tracker bar */}
              <div className="flex gap-2 justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
                <span className="font-bold uppercase tracking-wider">
                  Pergunta {activeQuestionIdx + 1} de {currentQuestions.length}
                </span>

                <div className="w-1/3 bg-neutral-100 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((activeQuestionIdx + 1) / currentQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question card */}
              <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-xl border border-neutral-150 dark:border-neutral-805 space-y-4">
                <h3 className="font-display font-medium text-lg leading-snug text-neutral-900 dark:text-white">
                  {currentQuestions[activeQuestionIdx]?.questionText}
                </h3>

                {/* Option listing */}
                <div className="space-y-2.5">
                  {currentQuestions[activeQuestionIdx]?.options.map((option: string, oIdx: number) => {
                    const selected = selectedAnswers[activeQuestionIdx] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(oIdx)}
                        className={`w-full text-left p-3.5 text-sm rounded-lg border cursor-pointer transition-all ${
                          selected
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-350 border-indigo-400 dark:border-indigo-800 font-semibold shadow-xs'
                            : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 font-black text-[11px] rounded-full flex items-center justify-center shrink-0 border transition-all ${
                            selected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-400'
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Control triggers */}
              <div className="flex justify-between items-center pt-4 border-t border-neutral-150 dark:border-neutral-750">
                <button
                  onClick={handlePrevQuestion}
                  disabled={activeQuestionIdx === 0}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-650 disabled:opacity-30 border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-200 text-xs font-semibold rounded-lg flex items-center gap-0.5 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>

                {activeQuestionIdx === currentQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submissionLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all shadow-sm"
                  >
                    {submissionLoading ? 'Processando...' : 'Finalizar e Enviar'}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-0.5 cursor-pointer"
                  >
                    Próxima <ChevronRight size={14} />
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* Complete In-Place Quiz Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-neutral-100 dark:border-neutral-700 shadow-2xl text-left">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-100 dark:border-neutral-700">
              <h3 className="font-display font-extrabold text-xl text-neutral-950 dark:text-white">
                {editingQuiz ? 'Editar Quiz Cadastrado' : 'Criar Novo Quiz Educacional'}
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

            <form onSubmit={handleSaveQuiz} className="space-y-6">
              
              {/* Metadata */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5" htmlFor="quiz-title-input">Título do Quiz</label>
                    <input 
                      id="quiz-title-input"
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-white"
                      placeholder="Ex: CSS Avançado e Media Queries"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5" htmlFor="quiz-category-select">Categoria</label>
                    <select 
                      id="quiz-category-select"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-neutral-950 dark:text-white cursor-pointer"
                    >
                      <option value="Programação">💻 Programação</option>
                      <option value="Ciências Naturais">🌱 Ciências Naturais</option>
                      <option value="Matemática">📐 Matemática</option>
                      <option value="Ciências Humanas">🌍 Ciências Humanas</option>
                      <option value="Idiómas">🗣️ Idiomas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 mb-1.5" htmlFor="quiz-desc-textarea">Breve Descrição do Quiz</label>
                  <textarea 
                    id="quiz-desc-textarea"
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-white"
                    placeholder="Quais conceitos serão abordados e avaliados neste questionário?"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-neutral-750 dark:text-neutral-300">Questões do Quiz</h4>
                  <button
                    type="button"
                    onClick={handleAddQuestionRow}
                    className="flex items-center gap-1 text-[11px] font-bold py-1 px-3 bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded border border-neutral-200 dark:border-neutral-600 cursor-pointer"
                  >
                    + Adicionar Questão
                  </button>
                </div>

                <div className="space-y-6">
                  {formQuestions.map((question, qIdx) => (
                    <div 
                      key={qIdx}
                      className="p-4 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-150 dark:border-neutral-750 rounded-xl space-y-3.5 relative"
                    >
                      {/* Remove question button */}
                      {formQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionRow(qIdx)}
                          className="absolute top-2.5 right-2 rounded hover:bg-red-50 p-1 text-red-500 font-bold text-xs cursor-pointer"
                          title="Remover Questão"
                        >
                          ✕
                        </button>
                      )}

                      <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                        Questão {qIdx + 1}
                      </span>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 mb-1" htmlFor={`q-text-${qIdx}`}>Pergunta</label>
                        <input 
                          id={`q-text-${qIdx}`}
                          type="text"
                          required
                          value={question.questionText}
                          onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                          className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded p-2 text-xs text-neutral-900 dark:text-white"
                          placeholder="Ex: O que é o Event Loop?"
                        />
                      </div>

                      {/* Alternatives / options (exactly 4 options for consistency) */}
                      <div className="space-y-2">
                        <span className="block text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 mb-1">Alternativas</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {question.options.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex gap-1.5 items-center">
                              <span className="text-[11px] font-bold text-neutral-400 w-4">{String.fromCharCode(65 + oIdx)}</span>
                              <input 
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                className="flex-1 bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded p-1.5 text-xs text-neutral-900 dark:text-white"
                                placeholder={`Alternativa ${opt || (oIdx + 1)}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Correct Index select */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 mb-1" htmlFor={`correct-ans-${qIdx}`}>Alternativa Correta (Gabarito)</label>
                          <select 
                            id={`correct-ans-${qIdx}`}
                            value={question.correctAnswerIndex}
                            onChange={(e) => handleCorrectIdxChange(qIdx, parseInt(e.target.value, 10))}
                            className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded p-1.5 text-xs text-neutral-950 dark:text-white cursor-pointer"
                          >
                            <option value={0}>Letra A</option>
                            <option value={1}>Letra B</option>
                            <option value={2}>Letra C</option>
                            <option value={3}>Letra D</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400 mb-1" htmlFor={`q-exp-${qIdx}`}>Explicação Didática</label>
                          <input 
                            id={`q-exp-${qIdx}`}
                            type="text"
                            value={question.explanation || ''}
                            onChange={(e) => handleQuestionExplanationChange(qIdx, e.target.value)}
                            className="w-full bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 rounded p-1.5 text-xs text-neutral-900 dark:text-white"
                            placeholder="Por que esta é a alternativa correta?"
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Form Save Controls */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-150 dark:border-neutral-755">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-quiz-form"
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {formLoading ? 'Salvando...' : 'Salvar Quiz'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
