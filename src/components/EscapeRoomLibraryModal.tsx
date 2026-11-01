import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Sparkles,
  BookOpen,
  Heart,
  Play,
  Plus,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Edit3,
  DoorOpen,
} from 'lucide-react';
import { EscapeRoomPack, EscapeRoomQuestion } from '../types';
import { SEED_ESCAPE_ROOM_LIBRARY, filterAndSortEscapeLibrary } from '../lib/escapeRoomEngine';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';

interface EscapeRoomLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackId?: string;
  onSelectPack: (pack: EscapeRoomPack) => void;
  defaultAuthorName?: string;
}

const SUBJECTS = [
  'Todos',
  'Multidisciplinar',
  'Química',
  'Biología',
  'Física',
  'Matemáticas',
  'Historia',
];

export const EscapeRoomLibraryModal: React.FC<EscapeRoomLibraryModalProps> = ({
  isOpen,
  onClose,
  selectedPackId,
  onSelectPack,
  defaultAuthorName = 'Profesor AulaPlay',
}) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'ai' | 'manual'>('explore');
  const [packs, setPacks] = useState<EscapeRoomPack[]>(SEED_ESCAPE_ROOM_LIBRARY);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Todos');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'likes'>('popular');
  const [previewPackId, setPreviewPackId] = useState<string | null>(null);
  const [likedPackIds, setLikedPackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('po_liked_escape_packs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI Creation states (10 Chambers)
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState('Multidisciplinar');
  const [aiAuthor, setAiAuthor] = useState(defaultAuthorName);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuccessBanner, setAiSuccessBanner] = useState<string | null>(null);

  // Manual Creation states
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubject, setManualSubject] = useState('Multidisciplinar');
  const [manualDescription, setManualDescription] = useState('');
  const [manualChambers, setManualChambers] = useState<EscapeRoomQuestion[]>([]);
  const [curQText, setCurQText] = useState('');
  const [curOpt0, setCurOpt0] = useState('');
  const [curOpt1, setCurOpt1] = useState('');
  const [curOpt2, setCurOpt2] = useState('');
  const [curOpt3, setCurOpt3] = useState('');
  const [curCorrectIdx, setCurCorrectIdx] = useState(0);
  const [curLockCode, setCurLockCode] = useState('');
  const [isSavingManual, setIsSavingManual] = useState(false);

  const fetchLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await fetch('/api/escape-room-library');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.packs) && data.packs.length > 0) {
          setPacks(data.packs);
          localStorage.setItem('po_cached_escape_library', JSON.stringify(data.packs));
        }
      }
    } catch {
      try {
        const cached = localStorage.getItem('po_cached_escape_library');
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
    return filterAndSortEscapeLibrary(packs, selectedSubject, searchQuery, sortBy);
  }, [packs, searchQuery, selectedSubject, sortBy]);

  const handleLikePack = async (packId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedPackIds.includes(packId)) return;
    playBalatroSound('select');

    const nextLiked = [...likedPackIds, packId];
    setLikedPackIds(nextLiked);
    localStorage.setItem('po_liked_escape_packs', JSON.stringify(nextLiked));

    setPacks((prev) =>
      prev.map((p) => (p.id === packId ? { ...p, likesCount: p.likesCount + 1 } : p))
    );

    try {
      await fetch(`/api/escape-room-library/${packId}/like`, { method: 'POST' });
    } catch {}
  };

  const handleUsePack = async (pack: EscapeRoomPack) => {
    playBalatroSound('play');
    try {
      fetch(`/api/escape-room-library/${pack.id}/play`, { method: 'POST' }).catch(() => {});
    } catch {}
    onSelectPack(pack);
  };

  const handleGenerateAiPack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    setIsGeneratingAi(true);
    setAiSuccessBanner(null);
    playBalatroSound('bubble');

    try {
      const res = await fetch('/api/generate-escape-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          subject: aiSubject,
          authorName: aiAuthor.trim() || 'Profesor con IA',
        }),
      });

      if (!res.ok) throw new Error('Error generando pack');
      const data = await res.json();
      if (data.pack) {
        setPacks((prev) => [data.pack, ...prev.filter((p) => p.id !== data.pack.id)]);
        setAiSuccessBanner(`¡Escape Room "${data.pack.title}" (10 Cámaras) generado y guardado en la Biblioteca Infinita!`);
        playBalatroSound('deal');
        setTimeout(() => {
          setActiveTab('explore');
          setPreviewPackId(data.pack.id);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      alert('Hubo un error al generar con IA. Inténtalo de nuevo.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddManualChamber = () => {
    if (!curQText.trim() || !curOpt0.trim() || !curOpt1.trim()) {
      alert('Por favor ingresa la pregunta y al menos las 2 primeras opciones.');
      return;
    }
    const options = [curOpt0.trim(), curOpt1.trim(), curOpt2.trim(), curOpt3.trim()].filter(Boolean);
    const chamberNum = manualChambers.length + 1;
    const newQ: EscapeRoomQuestion = {
      id: `q_${Date.now()}_${chamberNum}`,
      chamberTitle: `Cámara ${chamberNum}: Enigma #${chamberNum}`,
      question: curQText.trim(),
      options,
      correctOptionIndex: Math.min(curCorrectIdx, options.length - 1),
      lockCode: curLockCode.trim() || `L${chamberNum * 10}`,
      subject: manualSubject,
      hint: `Resuelve la Cámara ${chamberNum}.`,
    };

    setManualChambers((prev) => [...prev, newQ]);
    setCurQText('');
    setCurOpt0('');
    setCurOpt1('');
    setCurOpt2('');
    setCurOpt3('');
    setCurLockCode('');
    setCurCorrectIdx(0);
    playBalatroSound('click');
  };

  const handleSaveManualPack = async () => {
    if (!manualTitle.trim()) {
      alert('Por favor ingresa el título del Escape Room.');
      return;
    }
    if (manualChambers.length < 2) {
      alert('Agrega al menos 2 cámaras (recomendado 10 cámaras para un escape completo).');
      return;
    }

    setIsSavingManual(true);
    playBalatroSound('deal');
    try {
      const res = await fetch('/api/escape-room-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualTitle.trim(),
          description: manualDescription.trim() || `Escape Room de ${manualChambers.length} cámaras creado por el docente.`,
          subject: manualSubject,
          authorName: defaultAuthorName,
          tags: [manualSubject.toLowerCase(), `${manualChambers.length} cámaras`, 'manual'],
          chambers: manualChambers,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar');
      const data = await res.json();
      if (data.pack) {
        setPacks((prev) => [data.pack, ...prev]);
        setActiveTab('explore');
        setPreviewPackId(data.pack.id);
        setManualTitle('');
        setManualDescription('');
        setManualChambers([]);
        playBalatroSound('play');
      }
    } catch {
      alert('No se pudo guardar en la biblioteca.');
    } finally {
      setIsSavingManual(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#07060b]/85 backdrop-blur-md overflow-hidden select-none font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="w-full max-w-5xl h-[92vh] max-h-[880px] bg-[#0e0c15] border-2 border-[#26353d] shadow-[0_28px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-zinc-100"
      >
        {/* Top Bar — Campamento & Bitácora Dark Strip */}
        <div className="px-5 sm:px-7 py-3 bg-[#161421] border-b border-zinc-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <AulaPlayLogo size="sm" theme="light" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 hidden sm:inline">
              · BIBLIOTECA INFINITA · ESCAPE ROOM (10 CÁMARAS)
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            className="p-1.5 bg-[#1f1d2e] hover:bg-rose-950/80 text-zinc-300 hover:text-rose-200 border border-zinc-700 hover:border-rose-500/50 flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar biblioteca"
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
              V · ARCHIVO DE CÁMARAS
            </div>
            <h2 className="font-serif text-lg sm:text-2xl tracking-[0.18em] uppercase text-zinc-900 font-bold mt-1">
              Biblioteca Didáctica · Escape Room
            </h2>

            {/* Diamond Divider (───◇───) */}
            <div className="flex items-center justify-center w-56 sm:w-72 mx-auto my-1.5">
              <div className="flex-1 h-px bg-zinc-400" />
              <div className="w-2 h-2 rotate-45 border border-zinc-600 bg-[#f0f0f2] mx-2" />
              <div className="flex-1 h-px bg-zinc-400" />
            </div>

            <p className="text-xs text-zinc-600">
              Explora o genera mazmorras académicas de 10 cámaras con IA para proyectar en tus salas de clase.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-7 py-2.5 bg-[#14121f] border-b border-zinc-800 flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              playBalatroSound('select');
              setActiveTab('explore');
            }}
            className={cn(
              'px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border',
              activeTab === 'explore'
                ? 'bg-[#22e584] text-slate-950 border-[#22e584]'
                : 'bg-[#0b1114] text-zinc-300 border-[#26353d] hover:border-[#22e584]/50 hover:text-white'
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
              'px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border',
              activeTab === 'ai'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-[#0b1114] text-zinc-300 border-[#26353d] hover:border-amber-400/50 hover:text-white'
            )}
          >
            <Sparkles size={14} />
            <span>Crear con IA (10 Cámaras)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playBalatroSound('select');
              setActiveTab('manual');
            }}
            className={cn(
              'px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border',
              activeTab === 'manual'
                ? 'bg-[#22e584] text-slate-950 border-[#22e584]'
                : 'bg-[#0b1114] text-zinc-300 border-[#26353d] hover:border-[#22e584]/50 hover:text-white'
            )}
          >
            <Edit3 size={14} />
            <span>Crear Manualmente</span>
          </button>
        </div>

        {/* Tab 1: Explore Community Library */}
        {activeTab === 'explore' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0e0c15]">
            {/* Search Bar & Sorters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/60 p-3 sm:p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por tema, materia, pregunta o autor (ej. Leyes de Newton, Célula, Álgebra, Egipto)..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400 font-medium hidden lg:inline">Ordenar:</span>
                <button
                  type="button"
                  onClick={() => setSortBy('popular')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
                    sortBy === 'popular'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  )}
                >
                  Más Jugados
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('recent')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
                    sortBy === 'recent'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  )}
                >
                  Recientes
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('likes')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
                    sortBy === 'likes'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  )}
                >
                  Favoritos
                </button>
              </div>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <div className="flex items-center gap-1.5 shrink-0">
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      playBalatroSound('select');
                      setSelectedSubject(sub);
                    }}
                    className={cn(
                      'px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all',
                      selectedSubject === sub
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50'
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {isLoadingLibrary && (
                <span className="text-xs text-emerald-400 animate-pulse font-medium whitespace-nowrap">
                  Actualizando biblioteca...
                </span>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium whitespace-nowrap cursor-pointer shrink-0 ml-2"
              >
                ¿No encuentras tu tema? Créalo con IA
              </button>
            </div>

            {/* Packs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {filteredPacks.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 space-y-3">
                  <div className="text-4xl">🔐</div>
                  <p className="text-base font-semibold text-slate-200">No se encontraron Escape Rooms con esos filtros</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai')}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 cursor-pointer shadow-md inline-flex items-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>Crear este tema con IA (10 Cámaras)</span>
                  </button>
                </div>
              ) : (
                filteredPacks.map((pack) => {
                  const isPreview = previewPackId === pack.id;
                  const isLiked = likedPackIds.includes(pack.id);
                  const isSelected = selectedPackId === pack.id;

                  return (
                    <motion.div
                      key={pack.id}
                      layout
                      className={cn(
                        'bg-slate-950/70 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all relative overflow-hidden',
                        isSelected
                          ? 'border-emerald-400 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                          : 'border-slate-800 hover:border-slate-700'
                      )}
                    >
                      <div className="space-y-2.5">
                        {/* Badges & Stats */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {pack.subject}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              {pack.chambers.length} Cámaras
                            </span>
                            {pack.isAiGenerated && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 flex items-center gap-1">
                                <Sparkles size={10} />
                                <span>IA</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-400" title="Partidas jugadas por la comunidad">
                              🎮 {pack.playsCount}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleLikePack(pack.id, e)}
                              className={cn(
                                'flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer',
                                isLiked
                                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-rose-400'
                              )}
                              title="Me gusta este Escape Room"
                            >
                              <Heart size={12} className={isLiked ? 'fill-rose-400 text-rose-400' : ''} />
                              <span>{pack.likesCount}</span>
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                            {pack.title}
                          </h3>
                          <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                            {pack.description}
                          </p>
                        </div>

                        {/* Author & Preview toggle */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>👤 Por: <strong>{pack.authorName}</strong></span>
                          <button
                            type="button"
                            onClick={() => setPreviewPackId(isPreview ? null : pack.id)}
                            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            {isPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                            <span>{isPreview ? 'Ocultar cámaras' : `Ver ${pack.chambers.length} cámaras`}</span>
                          </button>
                        </div>

                        {/* Chambers Drawer Preview */}
                        <AnimatePresence>
                          {isPreview && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden pt-2 border-t border-slate-800 space-y-2"
                            >
                              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                                {pack.chambers.map((chamber, cIdx) => (
                                  <div
                                    key={chamber.id || cIdx}
                                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1"
                                  >
                                    <div className="flex items-center justify-between font-bold text-emerald-300">
                                      <span className="flex items-center gap-1">
                                        <DoorOpen size={13} />
                                        <span>{chamber.chamberTitle || `Cámara ${cIdx + 1}`}</span>
                                      </span>
                                      <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                        PIN: {chamber.lockCode}
                                      </span>
                                    </div>
                                    <p className="text-slate-200 text-[11px] leading-snug">
                                      {chamber.question}
                                    </p>
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                      {chamber.options.map((opt, oIdx) => (
                                        <span
                                          key={oIdx}
                                          className={cn(
                                            'text-[10px] px-1.5 py-0.5 rounded',
                                            oIdx === chamber.correctOptionIndex
                                              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-semibold'
                                              : 'bg-slate-800 text-slate-400'
                                          )}
                                        >
                                          {opt}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Select & Play Button */}
                      <div className="pt-4 mt-2 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => handleUsePack(pack)}
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play size={14} className="fill-slate-950" />
                          <span>Seleccionar y Jugar este Escape Room ({pack.chambers.length} Cámaras)</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Create with AI and Auto-Save (10 Chambers) */}
        {activeTab === 'ai' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-2xl mx-auto w-full space-y-6">
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Sparkles size={14} />
                <span>Generador IA Permanente · 10 Cámaras</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Crea un Escape Room de 10 Cámaras con IA
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Escribe cualquier materia o tema. La IA creará 10 cámaras pedagógicas completas y las guardará automáticamente en la Biblioteca Infinita comunitaria.
              </p>
            </div>

            {aiSuccessBanner && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{aiSuccessBanner}</span>
              </div>
            )}

            <form onSubmit={handleGenerateAiPack} className="space-y-4 bg-slate-950/60 p-5 sm:p-6 rounded-2xl border border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1.5">
                  Tema o Contenido de la Clase:
                </label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ej. Sistema Solar, Tabla Periódica, Mitosis Celular, Revolución Francesa, Leyes de Newton..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1.5">
                    Asignatura / Categoría:
                  </label>
                  <select
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    {SUBJECTS.filter((s) => s !== 'Todos').map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200 block mb-1.5">
                    Nombre del Autor / Docente:
                  </label>
                  <input
                    type="text"
                    value={aiAuthor}
                    onChange={(e) => setAiAuthor(e.target.value)}
                    placeholder="Ej. Prof. García"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Globe size={15} className="text-emerald-400 shrink-0" />
                <span>Al generar, este Escape Room de 10 cámaras quedará guardado para siempre en la Biblioteca Infinita para que tú y otros docentes o alumnos puedan jugarlo sin necesidad de usar IA nuevamente.</span>
              </div>

              <button
                type="submit"
                disabled={isGeneratingAi || !aiTopic.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Diseñando 10 Cámaras con IA y Guardando en Biblioteca...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generar Escape Room (10 Cámaras) y Guardar en Biblioteca</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Create Manually */}
        {activeTab === 'manual' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 size={15} className="text-emerald-400" />
                  <span>Datos Generales del Escape Room</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">Título del Escape Room:</label>
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="Ej. Desafío de Genética y ADN"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">Asignatura:</label>
                    <select
                      value={manualSubject}
                      onChange={(e) => setManualSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 cursor-pointer"
                    >
                      {SUBJECTS.filter((s) => s !== 'Todos').map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Descripción pedagógica:</label>
                  <input
                    type="text"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="Breve explicación para los estudiantes..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Form to add a chamber */}
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <DoorOpen size={14} />
                    <span>Añadir Cámara #{manualChambers.length + 1} (Objetivo: 10 Cámaras)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {manualChambers.length} / 10 creadas
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Pregunta o Acertijo:</label>
                  <textarea
                    rows={2}
                    value={curQText}
                    onChange={(e) => setCurQText(e.target.value)}
                    placeholder="Escribe el desafío que los alumnos deberán resolver para abrir la puerta..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Opción 1 (A):</label>
                    <input
                      type="text"
                      value={curOpt0}
                      onChange={(e) => setCurOpt0(e.target.value)}
                      placeholder="Opción 1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Opción 2 (B):</label>
                    <input
                      type="text"
                      value={curOpt1}
                      onChange={(e) => setCurOpt1(e.target.value)}
                      placeholder="Opción 2"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Opción 3 (C) (Opcional):</label>
                    <input
                      type="text"
                      value={curOpt2}
                      onChange={(e) => setCurOpt2(e.target.value)}
                      placeholder="Opción 3"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Opción 4 (D) (Opcional):</label>
                    <input
                      type="text"
                      value={curOpt3}
                      onChange={(e) => setCurOpt3(e.target.value)}
                      placeholder="Opción 4"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-300 font-semibold block mb-1">Opción Correcta:</label>
                    <select
                      value={curCorrectIdx}
                      onChange={(e) => setCurCorrectIdx(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 cursor-pointer"
                    >
                      <option value={0}>Opción 1 (A)</option>
                      <option value={1}>Opción 2 (B)</option>
                      <option value={2}>Opción 3 (C)</option>
                      <option value={3}>Opción 4 (D)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-semibold block mb-1">Código PIN de la Cámara:</label>
                    <input
                      type="text"
                      value={curLockCode}
                      onChange={(e) => setCurLockCode(e.target.value.toUpperCase())}
                      placeholder="Ej. 4610 o CLAVE1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddManualChamber}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus size={14} />
                  <span>Añadir Cámara a la Lista</span>
                </button>
              </div>

              {/* Chambers list created so far */}
              {manualChambers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    Cámaras añadidas ({manualChambers.length}):
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {manualChambers.map((ch, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-bold text-emerald-400 mr-2">#{idx + 1}</span>
                          <span className="text-slate-200">{ch.question}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setManualChambers((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-400 hover:text-rose-300 font-bold text-[11px] cursor-pointer shrink-0"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveManualPack}
                    disabled={isSavingManual || manualChambers.length === 0}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-3"
                  >
                    <BookOpen size={15} />
                    <span>Guardar Escape Room en la Biblioteca Comunitaria</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
