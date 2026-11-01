import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy,
  Check,
  QrCode,
  Users,
  Play,
  Settings,
  Sparkles,
  Share2,
  Clock,
} from 'lucide-react';
import { playBalatroSound, isSfxMuted, setSfxMuted } from '../lib/soundEffects';
import { QRCodeSVG } from 'qrcode.react';
import { HeatGuardianLobbyShell, HeatGuardianMenuItem } from './HeatGuardianBackdrop';

export interface EscapeRoomLobbyProps {
  roomCode: string;
  roomName?: string;
  totalInitialSeconds: number;
  questionsCount: number;
  activePackTitle?: string;
  wrongPenaltySecs?: number;
  enableJumpscare?: boolean;
  onStartMatch: () => void;
  onOpenSettings: (tab: 'time' | 'rules' | 'ai' | 'questions') => void;
  onOpenEscapeLibrary?: () => void;
  onExit: () => void;
  players?: Array<{ id: string; name: string; avatar: string; ready: boolean }>;
  isHost?: boolean;
  isTeacherSpectator?: boolean;
  onOpenTeacherSummary?: () => void;
}

export const EscapeRoomLobby: React.FC<EscapeRoomLobbyProps> = ({
  roomCode,
  roomName,
  totalInitialSeconds,
  questionsCount,
  activePackTitle,
  wrongPenaltySecs = 20,
  enableJumpscare = true,
  onStartMatch,
  onOpenSettings,
  onOpenEscapeLibrary,
  onExit,
  players = [],
  isHost = true,
  isTeacherSpectator = false,
  onOpenTeacherSummary,
}) => {
  const uniquePlayers = useMemo(() => {
    const seen = new Set<string>();
    return players.filter((p) => {
      const anyP = p as any;
      if (
        anyP.isSpectator ||
        anyP.role === 'teacher' ||
        p.name.toLowerCase().includes('profesor') ||
        p.name.toLowerCase().includes('docente') ||
        (isTeacherSpectator && anyP.isHost)
      ) {
        return false;
      }
      const key = `${p.name.trim().toLowerCase()}_${p.avatar}`;
      if (seen.has(key) || seen.has(p.id)) return false;
      seen.add(key);
      seen.add(p.id);
      return true;
    });
  }, [players, isTeacherSpectator]);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(isSfxMuted());

  const hostDisplay = typeof window !== 'undefined' ? window.location.host : 'escaperoom.edu';
  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?room=${roomCode}&game=escape_room`
      : `https://escaperoom.edu?room=${roomCode}&game=escape_room`;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch {}
    setCopiedCode(true);
    playBalatroSound('select');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
    } catch {}
    setCopiedUrl(true);
    playBalatroSound('select');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setSfxMuted(next);
    if (!next) playBalatroSound('click');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const menuItems: HeatGuardianMenuItem[] = [
    ...(isHost || isTeacherSpectator
      ? [
          {
            id: 'play',
            label: 'JUGAR',
            isPrimary: true,
            onClick: onStartMatch,
          },
          {
            id: 'rules',
            label: 'AJUSTES',
            badge: `${formatTime(totalInitialSeconds)}`,
            onClick: () => onOpenSettings('rules'),
          },
          {
            id: 'time',
            label: 'TIEMPO',
            onClick: () => onOpenSettings('time'),
          },
        ]
      : []),
    ...(onOpenEscapeLibrary
      ? [
          {
            id: 'library',
            label: 'BIBLIOTECA',
            badge: `${questionsCount} CÁM`,
            onClick: onOpenEscapeLibrary,
          },
        ]
      : []),
    {
      id: 'qr',
      label: 'CÓDIGO QR',
      onClick: () => setIsQrModalOpen(true),
    },
    {
      id: 'exit',
      label: 'SALIR',
      isDanger: true,
      onClick: onExit,
    },
  ];

  return (
    <HeatGuardianLobbyShell
      titleLine1="ESCAPE"
      titleLine2="GUARDIAN"
      subtitleBadge="SUPERVIVENCIA ACADÉMICA"
      roomCode={roomCode}
      menuItems={menuItems}
      soundMuted={soundMuted}
      onToggleSound={toggleSound}
      onToggleFullscreen={toggleFullscreen}
      variant="crimson_mist"
      footerCredit={roomName || 'ESCAPE ROOM EDUCATIVO'}
    >
      {/* MAIN WEATHERED SLATE MISSION CONTROL PANEL */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-[#0b1114]/90 border-2 border-[#2a3b44] shadow-[0_24px_65px_rgba(0,0,0,0.92)] p-5 sm:p-6 backdrop-blur-md space-y-5"
      >
        {/* Top Row: Steps 1 & 2 on the left, QR on the right */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          <div className="md:col-span-2 flex flex-col justify-between space-y-3">
            {/* Step 1: URL */}
            <div className="bg-[#121c21]/95 border border-[#283842] p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1c2a32] text-amber-400 font-black text-sm flex items-center justify-center shrink-0 border border-amber-500/40 font-mono">
                01
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block leading-tight">
                  Enlace de acceso para dispositivos:
                </span>
                <div
                  onClick={handleCopyUrl}
                  className="text-sm sm:text-base font-mono text-amber-300 font-bold truncate block cursor-pointer hover:underline mt-0.5"
                  title="Clic para copiar enlace directo"
                >
                  {hostDisplay}
                </div>
              </div>
              <button
                onClick={handleCopyUrl}
                className="p-2 bg-[#1a272e] hover:bg-[#243640] border border-slate-600/50 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copiar enlace de acceso"
              >
                {copiedUrl ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>

            {/* Step 2: HUGE JOIN CODE */}
            <div className="bg-[#121c21]/95 border border-[#283842] p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1c2a32] text-amber-400 font-black text-sm flex items-center justify-center shrink-0 border border-amber-500/40 font-mono">
                02
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block leading-tight">
                  {roomCode === 'SOLO'
                    ? 'Modo de expedición individual:'
                    : 'Código PIN de la expedición:'}
                </span>
                <div
                  onClick={handleCopyCode}
                  className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-[0.18em] text-white cursor-pointer hover:text-amber-400 transition-colors"
                  title="Clic para copiar código"
                >
                  {roomCode}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2.5 bg-[#1a272e] hover:bg-[#243640] border border-slate-600/50 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copiar código PIN"
              >
                {copiedCode ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Right 1 Col: QR Code Panel */}
          <div className="bg-[#121c21]/95 border border-[#283842] p-3.5 flex flex-col items-center justify-between text-center">
            <div
              onClick={() => setIsQrModalOpen(true)}
              className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-2 shadow-lg cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
              title="Clic para agrandar QR"
            >
              <QRCodeSVG value={joinUrl} size={96} level="M" includeMargin={false} />
            </div>

            <div className="w-full mt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                Compartir acceso
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleCopyUrl}
                  className="p-1.5 bg-[#1a272e] hover:bg-[#243640] border border-slate-600/50 text-slate-300 text-xs cursor-pointer"
                  title="Copiar enlace"
                >
                  <Share2 size={13} />
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `¡Únete a mi Escape Room! Ingresa en ${joinUrl} o usa el código ${roomCode}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-[#1a272e] hover:bg-[#243640] border border-slate-600/50 text-amber-300 text-xs cursor-pointer"
                  title="Compartir en WhatsApp"
                >
                  📱
                </a>
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="p-1.5 bg-[#1a272e] hover:bg-[#243640] border border-slate-600/50 text-slate-300 text-xs cursor-pointer"
                  title="Ver QR gigante"
                >
                  <QrCode size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Pack Banner & Library Selector */}
        <div className="bg-[#121c21]/95 border border-amber-500/40 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-amber-500/15 border border-amber-400/50 flex items-center justify-center text-base shrink-0">
              🗝️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-400">
                <span>EXPEDIENTE DE CÁMARAS</span>
                <span>·</span>
                <span className="text-slate-300">{questionsCount} CÁMARAS</span>
              </div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white truncate mt-0.5">
                {activePackTitle || 'Escape Multidisciplinar: Las 10 Cámaras del Saber'}
              </h4>
            </div>
          </div>

          {onOpenEscapeLibrary && (
            <button
              type="button"
              onClick={() => {
                playBalatroSound('select');
                onOpenEscapeLibrary();
              }}
              className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles size={13} />
              <span>Biblioteca (10 Cámaras) / IA</span>
            </button>
          )}
        </div>

        {/* Bottom Row: Pre-game Teacher Settings & Primary Start Action */}
        <div className="pt-3 border-t border-[#26353d] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isHost || isTeacherSpectator ? (
              <>
                <button
                  onClick={() => {
                    onOpenSettings('time');
                    playBalatroSound('click');
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#142026] hover:bg-[#1c2d36] border border-slate-600/60 hover:border-amber-400 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  title="Configurar tiempo exacto, IA y preguntas antes de empezar"
                >
                  <Settings size={15} className="text-amber-400" />
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Tiempo y Cámaras
                    </span>
                    <span className="text-amber-300 font-mono font-bold">
                      ⏱️ {formatTime(totalInitialSeconds)} · {questionsCount} Cám.
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenSettings('rules');
                    playBalatroSound('click');
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#142026] hover:bg-[#1c2d36] border border-amber-500/40 hover:border-amber-400 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  title="Configurar penalizaciones, orden aleatorio, puntos y modo susto"
                >
                  <span className="text-sm">⚙️</span>
                  <div className="text-left leading-tight">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Reglas Docente
                    </span>
                    <span className="text-slate-100 font-mono font-bold">
                      {wrongPenaltySecs > 0 ? `-${wrongPenaltySecs}s error` : 'Sin resta'} ·{' '}
                      {enableJumpscare ? '👻 Susto ON' : '🛡️ Tranquilo'}
                    </span>
                  </div>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#121c21] border border-slate-700 text-slate-300 text-xs font-mono">
                <Settings size={15} className="text-slate-500 shrink-0" />
                <div className="text-left leading-tight">
                  <span className="text-[9px] text-slate-400 block uppercase">
                    Reglas del Docente
                  </span>
                  <span className="text-amber-300 font-bold">
                    ⏱️ {formatTime(totalInitialSeconds)} · {questionsCount} Cámaras
                  </span>
                </div>
              </div>
            )}

            {(isHost || isTeacherSpectator) && onOpenTeacherSummary && (
              <button
                onClick={onOpenTeacherSummary}
                className="px-3 py-2 bg-[#142026] hover:bg-[#1c2d36] border border-slate-600 text-slate-200 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                title="Ver resumen de calificaciones (0-100)"
              >
                <span>📊</span>
                <span className="hidden sm:inline">Notas (0-100)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#121c21] border border-[#283842] text-slate-200 font-mono text-xs font-bold">
              <Users size={15} className="text-amber-400" />
              <span>{uniquePlayers.length}</span>
            </div>

            {isHost || isTeacherSpectator ? (
              <button
                onClick={() => {
                  playBalatroSound('play');
                  onStartMatch();
                }}
                className="px-7 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-[0.2em] cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all flex items-center gap-2"
              >
                <Play size={16} fill="currentColor" />
                <span>INICIAR ▶</span>
              </button>
            ) : (
              <div className="px-4 py-2.5 bg-[#121c21] border border-amber-500/30 text-amber-300 font-bold text-xs font-mono flex items-center gap-2">
                <Clock size={14} className="text-amber-400 animate-spin" />
                <span>Esperando al docente...</span>
              </div>
            )}
          </div>
        </div>

        {/* Connected Students Roster */}
        <div className="pt-2 border-t border-[#1e2c34]">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
            Supervivientes conectados en la sala ({uniquePlayers.length}):
          </div>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
            {uniquePlayers.length === 0 ? (
              <div className="w-full text-center py-3 bg-[#10181d] border border-dashed border-slate-700/70 text-xs font-mono text-slate-400">
                Esperando alumnos con el código PIN{' '}
                <strong className="text-amber-400">{roomCode}</strong>...
              </div>
            ) : (
              uniquePlayers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#142026] border border-slate-600/60 text-xs font-mono"
                >
                  <span>{p.avatar}</span>
                  <span className="font-bold text-white">{p.name}</span>
                  <span className="text-[10px] text-amber-400 font-bold">LISTO</span>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* QR MODAL PREVIEW */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              className="bg-[#0b1114] border-2 border-amber-500/70 p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
            >
              <h3 className="font-sans text-lg font-black uppercase tracking-widest text-amber-400">
                Código QR · Escape Guardian
              </h3>
              <p className="font-mono text-xs text-slate-300">
                Escanea con la cámara para ingresar a la expedición:
              </p>

              <div className="w-56 h-56 bg-white p-3 mx-auto shadow-2xl flex items-center justify-center">
                <QRCodeSVG value={joinUrl} size={200} level="H" includeMargin={false} />
              </div>

              <div className="bg-[#121c21] p-3 border border-slate-700 text-center font-mono">
                <span className="text-[11px] text-slate-400 block uppercase">
                  PIN de la partida:
                </span>
                <span className="text-3xl font-black text-white tracking-widest">{roomCode}</span>
              </div>

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs cursor-pointer"
              >
                Cerrar QR
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </HeatGuardianLobbyShell>
  );
};
