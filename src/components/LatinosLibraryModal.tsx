import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sparkles,
  Heart,
  Play,
  Plus,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Flame,
  Clock,
  Wand2,
  Edit3,
} from 'lucide-react';
import { LatinoGamePack, LatinoRoundQuestion } from '../types';
import { SEED_LATINOS_LIBRARY, filterAndSortLibrary } from '../lib/cienLatinosEngine';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';

interface LatinosLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackId?: string;
  onSelectPack: (pack: LatinoGamePack) => void;
  defaultAuthorName?: string;
}

const SUBJECTS = [
  'Todos',
  'Cultura General',
  'Química',
  'Biología',
  'Física',
  'Matemáticas',
  'Historia',
];

export const LatinosLibraryModal: React.FC<LatinosLibraryModalProps> = ({
  isOpen,
  onClose,
  selectedPackId,
  onSelectPack,
  defaultAuthorName = 'Profesor AulaPlay',
}) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'ai' | 'manual'>('explore');
  const [packs, setPacks] = useState<LatinoGamePack[]>(SEED_LATINOS_LIBRARY);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Todos');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'likes'>('popular');
  const [previewPackId, setPreviewPackId] = useState<string | null>(null);
  const [likedPackIds, setLikedPackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('po_liked_latinos_packs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI Creation states
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState('Cultura General');
  const [aiAuthor, setAiAuthor] = useState(defaultAuthorName);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessBanner, setAiSuccessBanner] = useState<string | null>(null);

  // Manual Creation states
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubject, setManualSubject] = useState('Cultura General');
  const [manualPrompt, setManualPrompt] = useState('');
  const [manualAns1, setManualAns1] = useState('');
  const [manualAns2, setManualAns2] = useState('');
  const [manualAns3, setManualAns3] = useState('');
  const [manualAns4, setManualAns4] = useState('');
  const [manualAns5, setManualAns5] = useState('');
  const [manualRounds, setManualRounds] = useState<LatinoRoundQuestion[]>([]);
  const [isSavingManual, setIsSavingManual] = useState(false);

  const fetchLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await fetch('/api/latinos-library');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.packs) && data.packs.length > 0) {
          setPacks(data.packs);
          localStorage.setItem('po_cached_latinos_library', JSON.stringify(data.packs));
        }
      }
    } catch {
      try {
        const cached = localStorage.getItem('po_cached_latinos_library');
        if (cached) setPacks(JSON.parse(cached));
      } catch {}
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLibrary();
    }
  }, [isOpen]);

  const filteredPacks = useMemo(() => {
    return filterAndSortLibrary(packs, searchQuery, selectedSubject, sortBy);
  }, [packs, searchQuery, selectedSubject, sortBy]);

  const handleLikePack = async (packId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedPackIds.includes(packId)) return;
    playBalatroSound('select');

    const nextLiked = [...likedPackIds, packId];
    setLikedPackIds(nextLiked);
    localStorage.setItem('po_liked_latinos_packs', JSON.stringify(nextLiked));

    setPacks((prev) =>
      prev.map((p) => (p.id === packId ? { ...p, likesCount: p.likesCount + 1 } : p))
    );

    try {
      await fetch(`/api/latinos-library/${packId}/like`, { method: 'POST' });
    } catch {}
  };

  const handleUsePack = async (pack: LatinoGamePack) => {
    playBalatroSound('play');
    try {
      fetch(`/api/latinos-library/${pack.id}/play`, { method: 'POST' }).catch(() => {});
    } catch {}
    onSelectPack(pack);
    onClose();
  };

  const handleGenerateWithAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim() || isGeneratingAi) return;

    setIsGeneratingAi(true);
    setAiSuccessBanner(null);
    playBalatroSound('bubble');

    try {
      const res = await fetch('/api/generate-latinos-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          subject: aiSubject,
          authorName: aiAuthor.trim() || defaultAuthorName,
          roundsCount: 4,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.packs)) {
          setPacks(data.packs);
          localStorage.setItem('po_cached_latinos_library', JSON.stringify(data.packs));
        } else if (data.pack) {
          setPacks((prev) => [data.pack, ...prev]);
        }

        if (data.pack) {
          playBalatroSound('play');
          setAiTopic('');
          setAiSuccessBanner(
            `¡Pack "${data.pack.title}" creado con IA y guardado en la Biblioteca Infinita para todo el mundo!`
          );
          setActiveTab('explore');
          setSortBy('recent');
          setSelectedSubject('Todos');
        }
      }
    } catch (err) {
      console.error('Error generating AI pack:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddManualRound = () => {
    if (!manualPrompt.trim() || !manualAns1.trim() || !manualAns2.trim()) return;
    playBalatroSound('select');

    const newRound: LatinoRoundQuestion = {
      id: `mr_${Date.now()}_${manualRounds.length + 1}`,
      prompt: manualPrompt.trim(),
      subject: manualSubject,
      multiplier: manualRounds.length === 2 ? 2 : manualRounds.length >= 3 ? 3 : 1,
      answers: [
        { text: manualAns1.trim(), points: 35, synonyms: [manualAns1.trim().toLowerCase()] },
        { text: manualAns2.trim(), points: 25, synonyms: [manualAns2.trim().toLowerCase()] },
        {
          text: manualAns3.trim() || 'Respuesta Popular 3',
          points: 18,
          synonyms: [manualAns3.trim().toLowerCase()].filter(Boolean),
        },
        {
          text: manualAns4.trim() || 'Respuesta Popular 4',
          points: 12,
          synonyms: [manualAns4.trim().toLowerCase()].filter(Boolean),
        },
        {
          text: manualAns5.trim() || 'Respuesta Popular 5',
          points: 10,
          synonyms: [manualAns5.trim().toLowerCase()].filter(Boolean),
        },
      ],
    };

    setManualRounds((prev) => [...prev, newRound]);
    setManualPrompt('');
    setManualAns1('');
    setManualAns2('');
    setManualAns3('');
    setManualAns4('');
    setManualAns5('');
  };

  const handleSaveManualPack = async () => {
    if (!manualTitle.trim() || manualRounds.length === 0 || isSavingManual) return;
    setIsSavingManual(true);
    playBalatroSound('play');

    try {
      const res = await fetch('/api/latinos-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualTitle.trim(),
          description: `Pack comunitario de ${manualRounds.length} rondas sobre ${manualTitle.trim()}.`,
          subject: manualSubject,
          authorName: aiAuthor.trim() || defaultAuthorName,
          tags: [manualSubject.toLowerCase(), manualTitle.trim().toLowerCase()],
          rounds: manualRounds,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.packs)) {
          setPacks(data.packs);
        }
        setManualTitle('');
        setManualRounds([]);
        setAiSuccessBanner(`¡Pack "${data.pack?.title}" publicado en la Biblioteca Infinita!`);
        setActiveTab('explore');
        setSortBy('recent');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingManual(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#07060b]/85 backdrop-blur-md p-3 sm:p-5 select-none font-sans">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl bg-[#0e0c15] border-2 border-[#26353d] shadow-[0_28px_80px_rgba(0,0,0,0.95)] flex flex-col max-h-[90dvh] overflow-hidden text-zinc-100"
      >
        {/* Top Bar — Campamento & Bitácora Dark Strip */}
        <div className="px-5 sm:px-7 py-3 bg-[#161421] border-b border-zinc-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <AulaPlayLogo size="sm" theme="light" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 hidden sm:inline">
              · BIBLIOTECA INFINITA · 100 LATINOS DICEN
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            aria-label="Cerrar biblioteca"
            className="p-1.5 bg-[#1f1d2e] hover:bg-rose-950/80 text-zinc-300 hover:text-rose-200 border border-zinc-700 hover:border-rose-500/50 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Alabaster Header Strip — Matching Campamento & Bitácora Silhouette Header */}
        <div className="relative bg-[#f0f0f2] text-zinc-900 px-6 py-4 text-center border-b border-zinc-300 shrink-0 overflow-hidden">
          <svg
            className="absolute right-0 top-0 w-72 h-32 text-zinc-400/20 pointer-events-none"
            viewBox="0 0 400 200"
            fill="currentColor"
          >
            <polygon points="180,0 400,0 400,160 280,90" />
            <polygon points="240,0 400,0 400,90" className="text-zinc-500/20" />
            <circle cx="290" cy="48" r="14" className="text-zinc-700/20" />
          </svg>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="font-serif text-lg sm:text-xl font-bold text-[#9e1b24] tracking-[0.22em] leading-none">
              VI · ARCHIVO DE ENCUESTAS
            </div>
            <h2 className="font-serif text-lg sm:text-2xl tracking-[0.18em] uppercase text-zinc-900 font-bold mt-1">
              Biblioteca Didáctica · 100 Latinos Dicen
            </h2>

            {/* Diamond Divider (───◇───) */}
            <div className="flex items-center justify-center w-56 sm:w-72 mx-auto my-1.5">
              <div className="flex-1 h-px bg-zinc-400" />
              <div className="w-2 h-2 rotate-45 border border-zinc-600 bg-[#f0f0f2] mx-2" />
              <div className="flex-1 h-px bg-zinc-400" />
            </div>

            <p className="text-xs text-zinc-600">
              Busca y reutiliza tableros por equipos creados por docentes e IA para cualquier asignatura.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-7 py-2.5 bg-[#14121f] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playBalatroSound('select');
                setActiveTab('explore');
              }}
              className={cn(
                'px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer',
                activeTab === 'explore'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-[#0b1114] text-zinc-300 border-[#26353d] hover:border-amber-400/50 hover:text-white'
              )}
            >
              <Globe size={14} />
              <span>Explorar Biblioteca ({packs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playBalatroSound('select');
                setActiveTab('ai');
              }}
              className={cn(
                'px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer',
                activeTab === 'ai'
                  ? 'bg-[#22e584] text-slate-950 border-[#22e584]'
                  : 'bg-[#0b1114] text-zinc-300 border-[#26353d] hover:border-[#22e584]/50 hover:text-white'
              )}
            >
              <Wand2 size={14} />
              <span>Crear con IA</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playBalatroSound('select');
                setActiveTab('manual');
              }}
              className={cn(
                'px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 border transition-all cursor-pointer',
                activeTab === 'manual'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-[#0b1114] text-zinc-300 border-[#26353d] hover:border-amber-400/50 hover:text-white'
              )}
            >
              <Edit3 size={14} />
              <span>Crear Manualmente</span>
            </button>
          </div>
        </div>

        {/* Success notification banner */}
        {aiSuccessBanner && (
          <div className="mx-6 mt-3 px-4 py-2.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-200 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{aiSuccessBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setAiSuccessBanner(null)}
              className="text-emerald-300 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: EXPLORE INFINITE LIBRARY */}
        {activeTab === 'explore' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Search, Subject Filter & Sort Bar */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por tema, asignatura, pregunta o autor (ej. Tabla Periódica, Célula, Planetas, Newton)..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                {/* Sort Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {[
                    { id: 'popular', label: 'Más Jugados', icon: Flame },
                    { id: 'recent', label: 'Recientes', icon: Clock },
                    { id: 'likes', label: 'Favoritos', icon: Heart },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = sortBy === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSortBy(item.id as any)}
                        className={cn(
                          'px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-all',
                          active
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        )}
                      >
                        <Icon size={13} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Filter Chips */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {SUBJECTS.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        playBalatroSound('select');
                        setSelectedSubject(sub);
                      }}
                      className={cn(
                        'px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                        selectedSubject === sub
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('ai')}
                  className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 rounded-lg text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={13} className="text-purple-300" />
                  <span>¿No encuentras tu tema? Créalo con IA</span>
                </button>
              </div>
            </div>

            {/* Library Packs Grid */}
            {isLoadingLibrary && packs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-mono text-sm">
                Cargando Biblioteca Comunitaria...
              </div>
            ) : filteredPacks.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/60 border border-dashed border-slate-700 rounded-2xl p-6 space-y-3">
                <p className="text-sm text-slate-300 font-bold">
                  No se encontraron packs con "{searchQuery}".
                </p>
                <p className="text-xs text-slate-400">
                  ¡Puedes generarlo ahora mismo con IA y quedará guardado en la Biblioteca Infinita para todos!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAiTopic(searchQuery);
                    setActiveTab('ai');
                  }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-2"
                >
                  <Wand2 size={15} />
                  <span>Generar "{searchQuery || 'Nuevo Tema'}" con IA</span>
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredPacks.map((pack) => {
                  const isSelected = pack.id === selectedPackId;
                  const isPreviewOpen = previewPackId === pack.id;
                  const isLiked = likedPackIds.includes(pack.id);

                  return (
                    <div
                      key={pack.id}
                      className={cn(
                        'bg-slate-900/90 border-2 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg',
                        isSelected
                          ? 'border-amber-400 bg-slate-900 ring-2 ring-amber-400/20'
                          : 'border-slate-800 hover:border-amber-500/40'
                      )}
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-sans text-xs font-bold">
                              {pack.subject}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono text-[11px]">
                              {pack.rounds.length} Rondas
                            </span>
                            {pack.isAiGenerated && (
                              <span className="px-2 py-0.5 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-[10px] flex items-center gap-1">
                                <Sparkles size={10} />
                                <span>IA</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                            <span title="Partidas jugadas por la comunidad">
                              🎮 {pack.playsCount}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleLikePack(pack.id, e)}
                              className={cn(
                                'px-2 py-0.5 rounded-lg border flex items-center gap-1 cursor-pointer transition-colors',
                                isLiked
                                  ? 'bg-pink-950/80 border-pink-500/50 text-pink-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-pink-300'
                              )}
                            >
                              <Heart size={12} className={isLiked ? 'fill-pink-400 text-pink-400' : ''} />
                              <span>{pack.likesCount}</span>
                            </button>
                          </div>
                        </div>

                        <h3 className="font-sans text-base sm:text-lg font-extrabold text-white leading-snug">
                          {pack.title}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {pack.description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2.5">
                          <span>👤 Por: {pack.authorName}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPackId(isPreviewOpen ? null : pack.id)
                            }
                            className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {isPreviewOpen ? <EyeOff size={13} /> : <Eye size={13} />}
                            <span>{isPreviewOpen ? 'Ocultar preguntas' : 'Ver preguntas'}</span>
                          </button>
                        </div>

                        {/* Expandable Preview of Rounds */}
                        <AnimatePresence>
                          {isPreviewOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-3 pt-3 border-t border-slate-800 space-y-2 overflow-hidden"
                            >
                              {pack.rounds.map((r, rIdx) => (
                                <div
                                  key={r.id || rIdx}
                                  className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl text-xs"
                                >
                                  <div className="font-bold text-amber-300 mb-1">
                                    Ronda {rIdx + 1}: {r.prompt}
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {r.answers.map((ans, aIdx) => (
                                      <span
                                        key={aIdx}
                                        className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300"
                                      >
                                        #{aIdx + 1} {ans.text} ({ans.points} pts)
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Select / Play Button */}
                      <button
                        type="button"
                        onClick={() => handleUsePack(pack)}
                        className={cn(
                          'mt-4 w-full py-2.5 rounded-xl font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md',
                          isSelected
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        )}
                      >
                        <Play size={15} className="fill-slate-950" />
                        <span>
                          {isSelected
                            ? '✓ Pack Activo · Jugar con este Pack'
                            : 'Seleccionar y Jugar este Pack'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI PACK GENERATOR (AUTO-SAVES TO INFINITE LIBRARY) */}
        {activeTab === 'ai' && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <form onSubmit={handleGenerateWithAi} className="max-w-xl mx-auto space-y-5 bg-slate-900/90 border border-purple-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Wand2 size={24} />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-extrabold text-white">
                    Generador IA con Guardado Permanente
                  </h3>
                  <p className="text-xs text-slate-300">
                    Escribe cualquier tema y la IA creará un pack de 4 rondas estilo "100 Latinos Dicen" y lo guardará automáticamente en la Biblioteca Infinita para toda la comunidad.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-purple-300 block mb-1.5">
                  Tema o Contenido de tu Clase:
                </label>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ej. Sistema Solar, Segunda Guerra Mundial, Enlaces Químicos, Mitología Griega..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-purple-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-300 block mb-1.5">
                    Asignatura / Categoría:
                  </label>
                  <select
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                  >
                    {SUBJECTS.filter((s) => s !== 'Todos').map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-300 block mb-1.5">
                    Tu Nombre (Autor en la Biblioteca):
                  </label>
                  <input
                    type="text"
                    value={aiAuthor}
                    onChange={(e) => setAiAuthor(e.target.value)}
                    placeholder="Ej. Prof. García"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isGeneratingAi || !aiTopic.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:brightness-110 disabled:opacity-50 text-white font-sans font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles size={18} />
                <span>
                  {isGeneratingAi
                    ? 'Generando Encuestas y Guardando en Biblioteca...'
                    : 'Generar Pack con IA y Guardar en Biblioteca Infinita'}
                </span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MANUAL PACK CREATOR */}
        {activeTab === 'manual' && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="max-w-2xl mx-auto space-y-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
              <h3 className="font-sans text-base font-extrabold text-sky-300">
                Crear Pack Personalizado y Publicar en la Biblioteca Infinita
              </h3>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Título del Pack:
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ej. Repaso Final de Biología"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Asignatura:
                  </label>
                  <select
                    value={manualSubject}
                    onChange={(e) => setManualSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {SUBJECTS.filter((s) => s !== 'Todos').map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Round Sub-form */}
              <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3">
                <label className="text-xs font-bold text-amber-300 block">
                  Añadir Ronda #{manualRounds.length + 1} (5 Respuestas Populares = 100 Pts):
                </label>
                <input
                  type="text"
                  value={manualPrompt}
                  onChange={(e) => setManualPrompt(e.target.value)}
                  placeholder="Pregunta de encuesta (ej. Menciona un gas noble de la tabla periódica...)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                />

                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={manualAns1}
                    onChange={(e) => setManualAns1(e.target.value)}
                    placeholder="#1 Respuesta más popular (35 pts)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={manualAns2}
                    onChange={(e) => setManualAns2(e.target.value)}
                    placeholder="#2 Segunda respuesta (25 pts)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={manualAns3}
                    onChange={(e) => setManualAns3(e.target.value)}
                    placeholder="#3 Tercera respuesta (18 pts)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={manualAns4}
                    onChange={(e) => setManualAns4(e.target.value)}
                    placeholder="#4 Cuarta respuesta (12 pts)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={manualAns5}
                    onChange={(e) => setManualAns5(e.target.value)}
                    placeholder="#5 Quinta respuesta (10 pts)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white sm:col-span-2"
                  />
                </div>

                <button
                  type="button"
                  disabled={!manualPrompt.trim() || !manualAns1.trim() || !manualAns2.trim()}
                  onClick={handleAddManualRound}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Añadir Ronda al Pack ({manualRounds.length} añadidas)</span>
                </button>
              </div>

              {manualRounds.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveManualPack}
                  disabled={!manualTitle.trim() || isSavingManual}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer shadow-lg"
                >
                  Guardar Pack ({manualRounds.length} Rondas) en la Biblioteca Infinita
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
