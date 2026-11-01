import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Calendar,
  Trash2,
  Filter,
  Users,
  Award,
  RotateCcw,
} from 'lucide-react';
import {
  getMatchHistory,
  clearMatchHistory,
  deleteMatchRecord,
  restoreDefaultDemoData,
  MatchHistoryRecord,
} from '../lib/matchHistory';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'teacher' | 'student' | null;
  currentStudentName?: string;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  userRole,
}) => {
  const [history, setHistory] = useState<MatchHistoryRecord[]>(() => getMatchHistory());
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  if (!isOpen) return null;

  const handleClearAllHistory = () => {
    clearMatchHistory();
    setHistory([]);
    setIsConfirmingClearAll(false);
    playBalatroSound('click');
  };

  const handleDeleteSingleRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteMatchRecord(id);
    setHistory(updated);
    setDeleteConfirmationId(null);
    playBalatroSound('click');
  };

  const handleRestoreDemoData = () => {
    const restored = restoreDefaultDemoData();
    setHistory(restored);
    playBalatroSound('deal');
  };

  const filteredHistory = history.filter((rec) => {
    if (selectedFilter === 'poker') return rec.gameType === 'poker_quimico';
    if (selectedFilter === 'escape') return rec.gameType === 'escape_room';
    if (selectedFilter === 'latinos') return rec.gameType === 'cien_latinos';
    if (selectedFilter === 'impostor') return rec.gameType === 'el_impostor';
    if (selectedFilter === 'geografia') return rec.gameType === 'geografia_3d';
    return true;
  });

  // Calculate statistically sound academic averages
  const totalMatches = filteredHistory.length;
  const approvedMatches = filteredHistory.filter((r) => (r.grade ?? 0) >= 60).length;
  const passRate = totalMatches > 0 ? Math.round((approvedMatches / totalMatches) * 100) : 0;

  const averageGrade =
    totalMatches > 0
      ? Math.round(
          filteredHistory.reduce((acc, r) => acc + (r.grade ?? 0), 0) / totalMatches
        )
      : 0;

  const totalAccumulatedScore = filteredHistory.reduce((acc, r) => acc + (r.score ?? 0), 0);

  const getDarkGradeBadge = (grade: number) => {
    if (grade >= 90) {
      return {
        label: 'SOBRESALIENTE',
        classes: 'text-[#22e584] border-[#22e584]/50 bg-emerald-950/60',
      };
    }
    if (grade >= 75) {
      return {
        label: 'NOTABLE',
        classes: 'text-sky-300 border-sky-500/50 bg-sky-950/60',
      };
    }
    if (grade >= 60) {
      return {
        label: 'APROBADO',
        classes: 'text-amber-300 border-amber-500/50 bg-amber-950/60',
      };
    }
    return {
      label: 'EN REFUERZO',
      classes: 'text-rose-300 border-rose-500/50 bg-rose-950/60',
    };
  };

  const avgBadge = getDarkGradeBadge(averageGrade);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#07060b]/85 backdrop-blur-md p-3 sm:p-5 select-none font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 14 }}
        className="w-full max-w-5xl max-h-[92dvh] bg-[#0e0c15] border-2 border-[#26353d] shadow-[0_28px_80px_rgba(0,0,0,0.95)] flex flex-col text-zinc-100 overflow-hidden"
      >
        {/* Top Bar — Campamento & Bitácora Dark Strip */}
        <div className="px-5 sm:px-7 py-3 bg-[#161421] border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <AulaPlayLogo size="sm" theme="light" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 hidden sm:inline">
              · BITÁCORA DE HISTORIAL Y ESTADÍSTICAS (0-100)
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            className="p-1.5 bg-[#1f1d2e] hover:bg-rose-950/80 text-zinc-300 hover:text-rose-200 border border-zinc-700 hover:border-rose-500/50 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X size={16} />
          </button>
        </div>

        {/* Alabaster Header Strip — Matching Campamento & Bitácora Silhouette Header */}
        <div className="relative bg-[#f0f0f2] text-zinc-900 px-6 py-5 text-center border-b border-zinc-300 shrink-0 overflow-hidden">
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
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#9e1b24] tracking-[0.22em] leading-none">
              IV
            </div>
            <h2 className="font-serif text-lg sm:text-2xl tracking-[0.18em] uppercase text-zinc-900 font-bold mt-1">
              Historial de Partidas y Estadísticas
            </h2>

            {/* Diamond Divider (───◇───) */}
            <div className="flex items-center justify-center w-56 sm:w-72 mx-auto my-2">
              <div className="flex-1 h-px bg-zinc-400" />
              <div className="w-2 h-2 rotate-45 border border-zinc-600 bg-[#f0f0f2] mx-2" />
              <div className="flex-1 h-px bg-zinc-400" />
            </div>

            <p className="text-xs text-zinc-600">
              {userRole === 'teacher'
                ? '👨‍🏫 BITÁCORA DOCENTE: Seguimiento académico, notas ponderadas (0-100) y desempeño de la clase.'
                : '🧑‍🎓 BITÁCORA ESTUDIANTE: Tu libreta de calificaciones, rachas y progreso por actividad.'}
            </p>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-[#0e0c15]">
          {/* Key Academic Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#14121f] border border-[#26353d] p-3.5 text-center space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">
                Partidas Evaluadas
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-white block">
                {totalMatches}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block">
                {userRole === 'teacher' ? 'Sesiones registradas' : 'Participaciones'}
              </span>
            </div>

            <div className="bg-[#14121f] border border-[#26353d] p-3.5 text-center space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">
                Promedio (0-100)
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-[#22e584] block">
                {totalMatches > 0 ? `${averageGrade}/100` : '--/100'}
              </span>
              <span
                className={cn(
                  'text-[9px] font-mono font-bold px-2 py-0.5 inline-block border',
                  totalMatches > 0
                    ? avgBadge.classes
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                )}
              >
                {totalMatches > 0 ? avgBadge.label : 'SIN REGISTROS'}
              </span>
            </div>

            <div className="bg-[#14121f] border border-[#26353d] p-3.5 text-center space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">
                Tasa de Aprobación
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400 block">
                {totalMatches > 0 ? `${passRate}%` : '0%'}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block">
                {totalMatches > 0
                  ? `${approvedMatches} de ${totalMatches} aprobadas (≥60)`
                  : '0 aprobadas'}
              </span>
            </div>

            <div className="bg-[#14121f] border border-[#26353d] p-3.5 text-center space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">
                Puntos Acumulados
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-sky-400 block">
                {totalAccumulatedScore.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block">
                Puntaje global de bitácora
              </span>
            </div>
          </div>

          {/* Filter Bar & Clear Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <Filter size={13} className="text-amber-400" />
              <span className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider mr-1">
                Filtrar:
              </span>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'escape', label: '🗝️ Escape Room' },
                { id: 'latinos', label: '🎤 100 Latinos' },
                { id: 'impostor', label: '🕵️ El Impostor' },
                { id: 'geografia', label: '🌍 Globo 3D' },
                { id: 'poker', label: '🧪 Póker Químico' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    playBalatroSound('select');
                    setSelectedFilter(f.id);
                  }}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border',
                    selectedFilter === f.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-[#14121f] text-zinc-300 border-[#26353d] hover:border-amber-400/60'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {history.length > 0 ? (
                isConfirmingClearAll ? (
                  <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/50 p-1">
                    <span className="text-[11px] font-mono text-rose-200 font-bold px-1.5">
                      ¿Vaciar historial?
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold cursor-pointer transition-colors"
                    >
                      Sí, vaciar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClearAll(false)}
                      className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold cursor-pointer transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      playBalatroSound('hover');
                      setIsConfirmingClearAll(true);
                    }}
                    className="px-3 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Vaciar Historial</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleRestoreDemoData}
                  className="px-3 py-1 bg-[#14121f] hover:bg-[#1e1b2e] text-amber-300 border border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Cargar registros de ejemplo para previsualizar estadísticas"
                >
                  <RotateCcw size={13} />
                  <span>Cargar Datos de Muestra</span>
                </button>
              )}
            </div>
          </div>

          {/* List of Date-Stamped Match Records */}
          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="p-10 text-center bg-[#14121f] border-2 border-dashed border-[#26353d] space-y-2">
                <div className="text-3xl">📭</div>
                <h3 className="font-serif text-base font-bold uppercase tracking-wider text-white">
                  Bitácora sin registros en este filtro
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Las partidas finalizadas en Escape Room, 100 Latinos Dicen, El Impostor, Globo 3D o Póker Químico se registran automáticamente con fecha y calificación (0-100).
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRestoreDemoData}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Restaurar partidas de ejemplo
                  </button>
                </div>
              </div>
            ) : (
              filteredHistory.map((record) => {
                const isExpanded = expandedRecordId === record.id;
                const badge = getDarkGradeBadge(record.grade);
                const isConfirmingDelete = deleteConfirmationId === record.id;

                return (
                  <div
                    key={record.id}
                    className="bg-[#14121f] border border-[#26353d] hover:border-amber-500/40 p-4 space-y-2.5 transition-all relative"
                  >
                    {/* Top Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0b1114] border border-[#26353d] flex items-center justify-center text-xl shrink-0">
                          {record.gameType === 'escape_room'
                            ? '🗝️'
                            : record.gameType === 'cien_latinos'
                            ? '🎤'
                            : record.gameType === 'el_impostor'
                            ? '🕵️'
                            : record.gameType === 'geografia_3d'
                            ? '🌍'
                            : '🧪'}
                        </div>
                        <div>
                          <h4 className="font-serif text-sm sm:text-base font-bold uppercase tracking-wider text-white leading-tight">
                            {record.gameTitle}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-zinc-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} className="text-amber-400" />
                              <span>{record.dateStr}</span>
                            </span>
                            {record.roomCode && (
                              <span>· PIN: {record.roomCode}</span>
                            )}
                            <span>
                              · {record.playerAvatar} <strong className="text-zinc-200">{record.playerName}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Grade, Descriptor Badge, Points, and Delete Button */}
                      <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                        <div className="flex flex-col items-end font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm sm:text-base font-black text-white bg-[#0b1114] px-2.5 py-0.5 border border-[#26353d]">
                              NOTA {record.grade}/100
                            </span>
                            <span
                              className={cn(
                                'text-[10px] font-bold px-2 py-0.5 border',
                                badge.classes
                              )}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-400 font-bold mt-0.5">
                            {record.score.toLocaleString()} PTS
                          </span>
                        </div>

                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1 bg-rose-950 border border-rose-500/50 p-1">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSingleRecord(record.id, e)}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-mono font-bold cursor-pointer"
                            >
                              Borrar
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmationId(null);
                              }}
                              className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 text-[10px] font-mono font-bold cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playBalatroSound('hover');
                              setDeleteConfirmationId(record.id);
                            }}
                            className="p-1.5 text-zinc-500 hover:text-rose-300 hover:bg-rose-950/60 transition-colors cursor-pointer border border-transparent hover:border-rose-500/40"
                            title="Eliminar este registro"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Status and Details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
                      <span className="font-bold text-[#22e584] flex items-center gap-1.5">
                        <Award size={13} className="text-amber-400" />
                        <span>{record.statusText}</span>
                      </span>
                      <span className="text-zinc-400">{record.detailsText}</span>
                    </div>

                    {/* Teacher Breakdown Expandable Section */}
                    {userRole === 'teacher' && record.studentResults && record.studentResults.length > 0 && (
                      <div className="pt-2 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            playBalatroSound('click');
                            setExpandedRecordId(isExpanded ? null : record.id);
                          }}
                          className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Users size={13} />
                          <span>
                            {isExpanded
                              ? '▲ Ocultar Calificaciones de Estudiantes'
                              : `▼ Ver Calificaciones de la Clase (${record.studentResults.length} Alumnos Evaluados)`}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 bg-[#0b1114] border border-[#26353d] p-3 space-y-2">
                            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                              Libreta de Calificaciones por Estudiante · {record.dateStr}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {record.studentResults.map((st) => {
                                const stBadge = getDarkGradeBadge(st.grade);
                                return (
                                  <div
                                    key={st.id}
                                    className="bg-[#14121f] p-2.5 border border-[#26353d] flex items-center justify-between text-xs font-mono gap-2"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="text-base">{st.avatar}</span>
                                      <div className="truncate">
                                        <span className="font-bold truncate text-white block">
                                          {st.name}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 truncate block">
                                          {st.details}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                      <span className="font-black text-xs bg-[#0b1114] px-2 py-0.5 border border-[#26353d] text-white">
                                        {st.grade}/100
                                      </span>
                                      <span
                                        className={cn(
                                          'text-[9px] font-bold px-1.5 mt-0.5 border',
                                          stBadge.classes
                                        )}
                                      >
                                        {stBadge.label}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0a090f] border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400">
            Sistema de evaluación y bitácora académica en base 100
          </span>
          <button
            type="button"
            onClick={() => {
              playBalatroSound('click');
              onClose();
            }}
            className="px-5 py-2 bg-[#22e584] hover:bg-[#1bc971] text-slate-950 font-black text-xs uppercase tracking-[0.16em] cursor-pointer transition-colors"
          >
            Cerrar Historial ▶
          </button>
        </div>
      </motion.div>
    </div>
  );
};
