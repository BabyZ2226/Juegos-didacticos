import React from 'react';
import { motion } from 'motion/react';
import { X, LogIn, Plus, ShieldCheck, GraduationCap } from 'lucide-react';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { AulaPlayLogo } from './AulaPlayLogo';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSelectRole: (role: 'teacher' | 'student') => void;
  onClose?: () => void;
  currentRole?: 'teacher' | 'student' | null;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onSelectRole,
  onClose,
  currentRole = null,
}) => {
  if (!isOpen) return null;

  const handleChoose = (role: 'teacher' | 'student') => {
    playBalatroSound('play');
    onSelectRole(role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07060b]/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto select-none font-sans">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl my-auto bg-[#0e0c15] border-2 border-[#26353d] shadow-[0_28px_80px_rgba(0,0,0,0.95)] overflow-hidden text-zinc-100"
      >
        {/* Top Bar — Campamento & Bitácora Dark Strip */}
        <div className="px-5 sm:px-7 py-3.5 bg-[#161421] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AulaPlayLogo size="sm" theme="light" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 hidden sm:inline">
              · CAMPAMENTO & BITÁCORA DIDÁCTICA
            </span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={() => {
                playBalatroSound('click');
                onClose();
              }}
              aria-label="Cerrar selección de modo"
              className="p-1.5 bg-[#1f1d2e] hover:bg-rose-950/80 text-zinc-300 hover:text-rose-200 border border-zinc-700 hover:border-rose-500/50 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Alabaster Header Strip — Matching Campamento & Bitácora Silhouette Header */}
        <div className="relative bg-[#f0f0f2] text-zinc-900 px-6 py-7 text-center border-b border-zinc-300 overflow-hidden">
          <svg
            className="absolute right-0 top-0 w-72 h-36 text-zinc-400/20 pointer-events-none"
            viewBox="0 0 400 200"
            fill="currentColor"
          >
            <polygon points="180,0 400,0 400,160 280,90" />
            <polygon points="240,0 400,0 400,90" className="text-zinc-500/20" />
            <circle cx="290" cy="48" r="14" className="text-zinc-700/20" />
          </svg>

          <div className="relative z-10 max-w-lg mx-auto">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-[#9e1b24] tracking-[0.22em] leading-none">
              I · II
            </div>
            <h1 className="font-serif text-xl sm:text-2xl tracking-[0.18em] uppercase text-zinc-900 font-bold mt-1.5">
              ¿Cómo vas a ingresar hoy?
            </h1>

            {/* Diamond Divider (───◇───) */}
            <div className="flex items-center justify-center w-56 sm:w-72 mx-auto my-2.5">
              <div className="flex-1 h-px bg-zinc-400" />
              <div className="w-2.5 h-2.5 rotate-45 border border-zinc-600 bg-[#f0f0f2] mx-2" />
              <div className="flex-1 h-px bg-zinc-400" />
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Selecciona tu modo en la bitácora para abrir salas y monitorear cámaras como docente o unirte a la partida como estudiante.
            </p>
          </div>
        </div>

        {/* Two Architectural Monolith Role Cards (Docente vs Estudiante) */}
        <div className="p-5 sm:p-7 bg-[#0e0c15] grid sm:grid-cols-2 gap-5">
          {/* ROLE I: DOCENTE */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            onClick={() => handleChoose('teacher')}
            className={cn(
              'relative bg-[#14121f] border-2 p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all group',
              currentRole === 'teacher'
                ? 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                : 'border-[#26353d] hover:border-amber-400/80'
            )}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 bg-[#1e1b2e] border border-amber-500/40 flex items-center justify-center text-xl">
                    👨‍🏫
                  </div>
                  <div>
                    <span className="font-serif text-xs font-bold tracking-[0.2em] text-amber-400 block">
                      MODO I · DOCENTE
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-white group-hover:text-amber-300 transition-colors">
                      Bitácora del Docente
                    </h3>
                  </div>
                </div>
                <ShieldCheck size={18} className="text-amber-400 shrink-0" />
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Crea y configura salas en vivo con código PIN/QR, supervisa a los estudiantes mediante cámaras CCTV en tiempo real y consulta la tabla de calificaciones (0-100).
              </p>

              <div className="text-[11px] font-mono text-zinc-400 space-y-1 pt-1">
                <div>· Monitoreo CCTV en vivo (Espectador puro)</div>
                <div>· Bibliotecas didácticas e IA integradas</div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Plus size={14} />
                  <span>Entrar como Docente</span>
                </span>
                <span>▶</span>
              </button>
            </div>
          </motion.div>

          {/* ROLE II: ESTUDIANTE */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.15 }}
            onClick={() => handleChoose('student')}
            className={cn(
              'relative bg-[#14121f] border-2 p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all group',
              currentRole === 'student'
                ? 'border-[#22e584] shadow-[0_0_30px_rgba(34,229,132,0.2)]'
                : 'border-[#26353d] hover:border-[#22e584]/80'
            )}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 bg-[#122221] border border-[#22e584]/40 flex items-center justify-center text-xl">
                    🧑‍🎓
                  </div>
                  <div>
                    <span className="font-serif text-xs font-bold tracking-[0.2em] text-[#22e584] block">
                      MODO II · ESTUDIANTE
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wider text-white group-hover:text-[#22e584] transition-colors">
                      Bitácora del Estudiante
                    </h3>
                  </div>
                </div>
                <GraduationCap size={18} className="text-[#22e584] shrink-0" />
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Ingresa con el código PIN de tu profesor a la sala en vivo o entrena en solitario en Escape Room, 100 Latinos Dicen, El Impostor, Globo 3D y Póker Químico.
              </p>

              <div className="text-[11px] font-mono text-zinc-400 space-y-1 pt-1">
                <div>· Conexión inmediata por PIN de 6 dígitos</div>
                <div>· Entrenamiento individual y rachas en vivo</div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                className="w-full py-2.5 px-4 bg-[#22e584] hover:bg-[#1bc971] text-slate-950 font-black text-xs uppercase tracking-[0.16em] transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <LogIn size={14} />
                  <span>Entrar como Estudiante</span>
                </span>
                <span>▶</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer Strip */}
        <div className="px-6 py-3 bg-[#0a090f] border-t border-zinc-800/80 text-center text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400">
          Puedes alternar entre Bitácora Docente y Estudiante en cualquier momento desde la barra superior
        </div>
      </motion.div>
    </div>
  );
};
