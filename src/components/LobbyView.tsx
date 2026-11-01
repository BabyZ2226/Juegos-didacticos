import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy,
  Check,
  QrCode,
  Users,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Palette,
  Share2,
  Clock,
  LogOut,
  Crown,
  Minus,
  Plus,
  Info,
  Sparkles,
  Settings,
} from 'lucide-react';
import { playBalatroSound, isSfxMuted, setSfxMuted } from '../lib/soundEffects';
import { QRCodeSVG } from 'qrcode.react';
import { RoomState, GamePlayer } from '../types';
import { cn } from '../lib/utils';

export interface LobbyViewProps {
  room: RoomState;
  currentUserId: string;
  startingChips?: number;
  onSelectStartingChips?: (chips: number) => void;
  onStartGame: () => void;
  onSetBotCount: (count: number) => void;
  onLeaveRoom: () => void;
  onOpenRules: () => void;
}

export function LobbyView({
  room,
  currentUserId,
  startingChips = 1000,
  onSelectStartingChips,
  onStartGame,
  onSetBotCount,
  onLeaveRoom,
  onOpenRules,
}: LobbyViewProps) {
  const isHost = room.hostId === currentUserId;
  const isTeacherOrSpectator = (p: GamePlayer) => {
    return Boolean(
      p.isSpectator ||
      p.role === 'teacher' ||
      p.name.toLowerCase().includes('profesor') ||
      p.name.toLowerCase().includes('docente') ||
      (room.hostIsSpectator && p.id === room.hostId)
    );
  };

  const studentPlayers = useMemo(() => {
    return room.players.filter((p) => !p.isBot && !isTeacherOrSpectator(p));
  }, [room.players, room.hostIsSpectator, room.hostId]);

  const botPlayers = useMemo(() => {
    return room.players.filter((p) => p.isBot);
  }, [room.players]);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isTeacherConfigOpen, setIsTeacherConfigOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(isSfxMuted());
  const [currentTheme, setCurrentTheme] = useState<'neon' | 'dungeon' | 'cyber'>('neon');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Teacher Pre-game Configuration State for Póker del Octeto
  const [localChips, setLocalChips] = useState<number>(startingChips);
  const [betCapLimit, setBetCapLimit] = useState<number>(300); // 0 = Sin límite
  const [blindAmount, setBlindAmount] = useState<number>(25);
  const [chemicalHintsEnabled, setChemicalHintsEnabled] = useState<boolean>(true);
  const [winnerBonusPts, setWinnerBonusPts] = useState<number>(100);
  const [turnTimerSecs, setTurnTimerSecs] = useState<number>(0); // 0 = Sin límite

  const hostDisplay = typeof window !== 'undefined' ? window.location.host : 'pokerocteto.edu';
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${room.code}&game=${room.gameType || 'poker_quimico'}`
    : `https://pokerocteto.edu?room=${room.code}&game=${room.gameType || 'poker_quimico'}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      playBalatroSound('select');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedUrl(true);
      playBalatroSound('select');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
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

  // Theme color accents matching Escape Room Lobby
  const themeStyles = {
    neon: {
      leftDoor1: '#facc15',
      leftDoor2: '#ec4899',
      rightDoor1: '#f97316',
      rightDoor2: '#06b6d4',
      bgGradient: 'from-[#1a0826] via-[#12051a] to-[#0a020f]',
    },
    dungeon: {
      leftDoor1: '#dc2626',
      leftDoor2: '#9333ea',
      rightDoor1: '#b91c1c',
      rightDoor2: '#7e22ce',
      bgGradient: 'from-[#240a12] via-[#140612] to-[#08020a]',
    },
    cyber: {
      leftDoor1: '#10b981',
      leftDoor2: '#06b6d4',
      rightDoor1: '#3b82f6',
      rightDoor2: '#8b5cf6',
      bgGradient: 'from-[#071824] via-[#041019] to-[#02080d]',
    },
  }[currentTheme];

  return (
    <div className={`relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden select-none bg-gradient-to-b ${themeStyles.bgGradient} text-white font-sans`}>
      
      {/* 1. 3D PERSPECTIVE CORRIDOR BACKGROUND (IDENTICAL TO ESCAPE ROOM LOBBY) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="pokerVanishingGlow" cx="50%" cy="46%" r="50%">
              <stop offset="0%" stopColor="#1e0a2e" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#0d0414" stopOpacity="1" />
              <stop offset="100%" stopColor="#050108" stopOpacity="1" />
            </radialGradient>

            <linearGradient id="pokerDoorYellowGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={themeStyles.leftDoor1} stopOpacity="0.8" />
              <stop offset="100%" stopColor={themeStyles.leftDoor1} stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="pokerDoorPinkGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={themeStyles.leftDoor2} stopOpacity="0.75" />
              <stop offset="100%" stopColor={themeStyles.leftDoor2} stopOpacity="0.05" />
            </linearGradient>

            <linearGradient id="pokerDoorOrangeGlow" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor={themeStyles.rightDoor1} stopOpacity="0.8" />
              <stop offset="100%" stopColor={themeStyles.rightDoor1} stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="pokerDoorTealGlow" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor={themeStyles.rightDoor2} stopOpacity="0.75" />
              <stop offset="100%" stopColor={themeStyles.rightDoor2} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Vanishing back wall */}
          <rect width="1920" height="1080" fill="url(#pokerVanishingGlow)" />

          {/* CEILING PERSPECTIVE */}
          <polygon points="0,0 1920,0 1160,490 760,490" fill="#150622" opacity="0.6" />

          {/* LEFT WALL WITH GLOWING ARCHWAYS */}
          <polygon points="0,0 760,490 760,820 0,1080" fill="#1b082c" />

          {/* Left Door 1 (Foreground) */}
          <polygon
            points="0,180 280,310 280,950 0,1080"
            fill="url(#pokerDoorYellowGlow)"
            stroke={themeStyles.leftDoor1}
            strokeWidth="5"
          />
          <polygon points="20,230 250,335 250,920 20,1040" fill="#2d1702" opacity="0.8" />

          {/* Left Door 2 (Midground) */}
          <polygon
            points="380,355 580,430 580,870 380,920"
            fill="url(#pokerDoorPinkGlow)"
            stroke={themeStyles.leftDoor2}
            strokeWidth="4"
          />
          <polygon points="400,375 560,438 560,855 400,900" fill="#29052b" opacity="0.85" />

          {/* RIGHT WALL WITH GLOWING ARCHWAYS */}
          <polygon points="1920,0 1160,490 1160,820 1920,1080" fill="#1b082c" />

          {/* Right Door 1 (Foreground) */}
          <polygon
            points="1920,180 1640,310 1640,950 1920,1080"
            fill="url(#pokerDoorOrangeGlow)"
            stroke={themeStyles.rightDoor1}
            strokeWidth="5"
          />
          <polygon points="1900,230 1670,335 1670,920 1900,1040" fill="#300d02" opacity="0.8" />

          {/* Right Door 2 (Midground) */}
          <polygon
            points="1540,355 1340,430 1340,870 1540,920"
            fill="url(#pokerDoorTealGlow)"
            stroke={themeStyles.rightDoor2}
            strokeWidth="4"
          />
          <polygon points="1520,375 1360,438 1360,855 1520,900" fill="#032429" opacity="0.85" />

          {/* FLOOR PERSPECTIVE GRID */}
          <polygon points="0,1080 760,820 1160,820 1920,1080" fill="#0d0416" />

          {/* Converging Floor Grid Lines */}
          {[
            [120, 1080, 780, 820],
            [340, 1080, 820, 820],
            [600, 1080, 870, 820],
            [960, 1080, 960, 820],
            [1320, 1080, 1050, 820],
            [1580, 1080, 1100, 820],
            [1800, 1080, 1140, 820],
          ].map(([x1, y1, x2, y2], idx) => (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#431e5c"
              strokeWidth="2"
              opacity="0.5"
            />
          ))}

          {/* Horizontal Transverse Floor Lines */}
          {[840, 880, 930, 990, 1060].map((y, idx) => {
            const progress = (y - 820) / (1080 - 820);
            const xLeft = 760 - progress * 760;
            const xRight = 1160 + progress * (1920 - 1160);
            return (
              <line
                key={idx}
                x1={xLeft}
                y1={y}
                x2={xRight}
                y2={y}
                stroke="#582779"
                strokeWidth={1 + progress * 2}
                opacity={0.3 + progress * 0.4}
              />
            );
          })}

          {/* Floor Reflection Glows */}
          <ellipse cx="250" cy="1000" rx="220" ry="40" fill={themeStyles.leftDoor1} opacity="0.14" />
          <ellipse cx="500" cy="890" rx="140" ry="25" fill={themeStyles.leftDoor2} opacity="0.12" />
          <ellipse cx="1670" cy="1000" rx="220" ry="40" fill={themeStyles.rightDoor1} opacity="0.14" />
          <ellipse cx="1420" cy="890" rx="140" ry="25" fill={themeStyles.rightDoor2} opacity="0.12" />
        </svg>

        <div className="absolute inset-0 bg-radial from-transparent via-[#0e0316]/40 to-[#07010c]/80 pointer-events-none" />
      </div>

      {/* 2. TOP NAV BAR (MATCHING ESCAPE ROOM LOBBY) */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b border-white/10 bg-[#0d0416]/70 backdrop-blur-md">
        
        {/* Left: Game Title Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#250d38] border border-fuchsia-500/40 rounded-xl shadow-lg">
            <span className="text-lg">🧪</span>
            <div>
              <span className="font-medieval text-sm sm:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                PÓKER DEL OCTETO
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-retro-mono px-1.5 py-0.2 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800">
                SALA DE ESPERA
              </span>
            </div>
          </div>
          {room.name && (
            <span className="hidden md:inline-block text-xs font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
              {room.name}
            </span>
          )}
        </div>

        {/* Right: Controls & Terminar Button */}
        <div className="flex items-center gap-2 font-retro-mono text-xs">
          
          {/* Themes Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f0f30] hover:bg-[#2e1647] border border-white/10 rounded-xl text-zinc-200 transition-colors cursor-pointer text-xs"
              title="Cambiar tema de ambiente"
            >
              <Palette size={14} className="text-fuchsia-400" />
              <span className="hidden sm:inline">Temas</span>
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#1b0d2b] border border-fuchsia-500/40 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                {[
                  { id: 'neon', label: 'Neón Wayground' },
                  { id: 'dungeon', label: 'Cripta Oscura' },
                  { id: 'cyber', label: 'Cyber Matrix' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setCurrentTheme(th.id as any);
                      setIsThemeMenuOpen(false);
                      playBalatroSound('click');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      currentTheme === th.id
                        ? 'bg-fuchsia-600 text-white'
                        : 'text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 bg-[#1f0f30] hover:bg-[#2e1647] border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title={soundMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {soundMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-emerald-400" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-[#1f0f30] hover:bg-[#2e1647] border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Pantalla completa"
          >
            <Maximize size={15} />
          </button>

          {/* Vibrant Red "TERMINAR" button */}
          <button
            onClick={onLeaveRoom}
            className="px-4 py-1.5 bg-[#e11d48] hover:bg-[#f43f5e] active:scale-95 text-white font-bold rounded-xl cursor-pointer shadow-[0_4px_12px_rgba(225,29,72,0.5)] transition-all flex items-center gap-1.5"
          >
            <LogOut size={13} />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* 3. MAIN CENTER FLOATING PIN CARD (SAME ROOM DESIGN) */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-4">
        
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl bg-[#140b22]/95 border-2 border-white/10 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 backdrop-blur-xl space-y-5"
        >
          {/* Top Row: Steps 1 & 2 on the left, QR on the right */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            
            {/* Left 2 Cols: Step 1 (URL) & Step 2 (PIN Code) */}
            <div className="md:col-span-2 flex flex-col justify-between space-y-4">
              
              {/* Step 1: URL */}
              <div className="bg-[#1f1233]/80 border border-white/5 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-200 font-black text-sm flex items-center justify-center shrink-0 border border-zinc-700">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-retro-mono text-zinc-400 block leading-tight">
                    Únase usando cualquier dispositivo con el enlace:
                  </span>
                  <div
                    onClick={handleCopyUrl}
                    className="text-sm sm:text-base font-retro-mono text-cyan-300 font-bold truncate block cursor-pointer hover:underline"
                    title="Clic para copiar enlace directo"
                  >
                    {hostDisplay}
                  </div>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="p-2 bg-[#2d1b47] hover:bg-[#3d2561] text-zinc-300 hover:text-white rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Copiar enlace de acceso"
                >
                  {copiedUrl ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>

              {/* Step 2: HUGE JOIN CODE */}
              <div className="bg-[#1f1233]/80 border border-white/5 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-200 font-black text-sm flex items-center justify-center shrink-0 border border-zinc-700">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-retro-mono text-zinc-400 block leading-tight">
                    Ingresa el código PIN de acceso de la sala:
                  </span>
                  <div
                    onClick={handleCopyCode}
                    className="text-3xl sm:text-4xl md:text-5xl font-black font-retro-mono tracking-widest text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)] cursor-pointer hover:text-amber-300 transition-colors"
                    title="Clic para copiar código"
                  >
                    {room.code}
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-2.5 bg-[#2d1b47] hover:bg-[#3d2561] text-zinc-300 hover:text-white rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Copiar código PIN"
                >
                  {copiedCode ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                </button>
              </div>

            </div>

            {/* Right 1 Col: QR Code Panel */}
            <div className="bg-[#1f1233]/80 border border-white/5 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center">
              <div
                onClick={() => setIsQrModalOpen(true)}
                className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-2 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform flex items-center justify-center relative group"
                title="Clic para agrandar QR"
              >
                <QRCodeSVG
                  value={joinUrl}
                  size={96}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="w-full mt-2">
                <span className="text-[10px] font-retro-mono text-zinc-400 block mb-1">
                  Compartir vía
                </span>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleCopyUrl}
                    className="p-1.5 bg-[#2d1b47] hover:bg-[#3d2561] text-zinc-300 rounded-lg text-xs cursor-pointer"
                    title="Copiar enlace"
                  >
                    <Share2 size={13} />
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`¡Únete a la mesa de Póker del Octeto! Ingresa en ${joinUrl} o usa el código ${room.code}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 rounded-lg text-xs cursor-pointer"
                    title="Compartir en WhatsApp"
                  >
                    📱
                  </a>
                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="p-1.5 bg-[#2d1b47] hover:bg-[#3d2561] text-zinc-300 rounded-lg text-xs cursor-pointer"
                    title="Ver QR gigante"
                  >
                    <QrCode size={13} />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Row: Controls, EMPEZAR Button, and Player Count */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            
            {/* Game Options & Bots Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenRules}
                className="flex items-center gap-2 px-3 py-2 bg-[#231438] hover:bg-[#311c4e] border border-fuchsia-500/30 hover:border-fuchsia-400 rounded-xl text-zinc-200 text-xs font-bold transition-all cursor-pointer shadow-md"
                title="Ver reglas y jerarquía de moléculas"
              >
                <Info size={15} className="text-amber-400" />
                <div className="text-left leading-tight">
                  <span className="text-[10px] text-zinc-400 block font-normal">Guía Didáctica</span>
                  <span className="text-amber-300 font-retro-mono font-bold">Reglas & Tabla</span>
                </div>
              </button>

              {isHost && (
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('select');
                    setIsTeacherConfigOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#231438] hover:bg-[#311c4e] border border-emerald-500/40 hover:border-emerald-400 rounded-xl text-zinc-200 text-xs font-bold transition-all cursor-pointer shadow-md"
                  title="Configurar fichas iniciales, bots, apuestas y ayudas químicas"
                >
                  <Settings size={15} className="text-emerald-400" />
                  <div className="text-left leading-tight">
                    <span className="text-[10px] text-zinc-400 block font-normal">Ajustes Docente</span>
                    <span className="text-emerald-300 font-retro-mono font-bold">
                      💰 {localChips} · {chemicalHintsEnabled ? '🧪 Pistas ON' : '📝 Examen'}
                    </span>
                  </div>
                </button>
              )}

              {/* Bots Control Pill */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#1f1233] border border-white/10 rounded-xl text-zinc-200 font-retro-mono text-xs">
                <Sparkles size={14} className="text-amber-400" />
                <span className="font-bold text-amber-300">
                  {botPlayers.length} {botPlayers.length === 1 ? 'Bot' : 'Bots'}
                </span>
                {isHost && (
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      type="button"
                      onClick={() => onSetBotCount(Math.max(0, botPlayers.length - 1))}
                      disabled={botPlayers.length <= 0}
                      aria-label="Quitar bot"
                      className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-200 flex items-center justify-center border border-zinc-700 cursor-pointer"
                    >
                      <Minus size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetBotCount(Math.min(5, botPlayers.length + 1))}
                      disabled={botPlayers.length >= 5}
                      aria-label="Añadir bot"
                      className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-200 flex items-center justify-center border border-zinc-700 cursor-pointer"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* BIG VIBRANT "EMPEZAR" BUTTON (Teacher/Host) OR Student Waiting State */}
            <div className="flex-1 sm:flex-initial flex justify-center">
              {isHost ? (
                <button
                  onClick={() => {
                    playBalatroSound('play');
                    onStartGame();
                  }}
                  className="w-full sm:w-auto px-8 sm:px-12 py-3 bg-gradient-to-r from-[#d946ef] via-[#ec4899] to-[#d946ef] hover:brightness-110 active:translate-y-1 text-white font-black text-sm sm:text-base rounded-2xl cursor-pointer shadow-[0_6px_0_#9d174d,0_10px_20px_rgba(217,70,239,0.5)] transition-all flex items-center justify-center gap-2 tracking-wider uppercase font-medieval"
                >
                  <Play size={18} fill="currentColor" />
                  <span>EMPEZAR</span>
                </button>
              ) : (
                <div className="w-full sm:w-auto px-6 py-3 bg-[#180c29] border border-amber-500/30 rounded-2xl text-amber-300 font-bold text-xs sm:text-sm font-retro-mono shadow-md flex items-center justify-center gap-2 select-none">
                  <Clock size={16} className="text-amber-400 animate-spin-slow" />
                  <span>Esperando a que el profesor inicie la partida...</span>
                </div>
              )}
            </div>

            {/* Connected Player Counter */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1f1233] border border-white/10 rounded-xl text-zinc-200 font-retro-mono text-xs font-bold">
              <Users size={16} className="text-fuchsia-400" />
              <span>{studentPlayers.length}/{room.maxPlayers}</span>
            </div>

          </div>

        </motion.div>

        {/* 4. CONNECTED STUDENTS / PLAYERS ROSTER SECTION */}
        <div className="w-full max-w-2xl mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-retro-mono text-zinc-300 px-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Estudiantes conectados a la mesa ({studentPlayers.length})...</span>
            </span>
          </div>

          {/* Student Badges Grid */}
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
            {studentPlayers.length === 0 ? (
              <div className="w-full text-center py-3 bg-[#140b22]/70 border border-dashed border-white/10 rounded-2xl text-xs font-retro-mono text-zinc-400">
                Aún no hay estudiantes sentados en la mesa. Comparte el código PIN o enlace en el aula.
              </div>
            ) : (
              studentPlayers.map((p) => {
                const isMe = p.id === currentUserId;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 bg-[#1f1233]/90 border rounded-xl shadow-sm text-xs font-retro-mono animate-fadeIn',
                      isMe ? 'border-amber-400/60 bg-[#2d1b47]' : 'border-fuchsia-500/30'
                    )}
                  >
                    <span className="text-base">{p.avatar}</span>
                    <span className="font-bold text-zinc-100 flex items-center gap-1">
                      {p.name}
                      {p.isHost && <Crown size={12} className="text-amber-400" />}
                      {isMe && <span className="text-[9px] bg-white/10 px-1 rounded text-amber-300 font-mono">Tú</span>}
                    </span>
                    <span className="text-[10px] font-bold px-1 py-0.5 rounded text-emerald-400">
                      ✓ Listo
                    </span>
                  </div>
                );
              })
            )}

            {/* Bots */}
            {botPlayers.map((bot) => (
              <div
                key={bot.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#140b22]/80 border border-zinc-700/50 rounded-xl text-xs font-retro-mono text-zinc-300 opacity-90"
              >
                <span>{bot.avatar}</span>
                <span className="font-medium">{bot.name}</span>
                <span className="text-[10px] text-cyan-400">🤖 Bot IA</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* QR MODAL PREVIEW */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#170c26] border-2 border-fuchsia-500 p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl"
            >
              <h3 className="font-medieval text-xl font-bold text-amber-400">
                Código QR de la Mesa
              </h3>
              <p className="font-retro-mono text-xs text-zinc-300">
                Los estudiantes pueden escanear este código con su móvil para unirse a la partida:
              </p>
              
              <div className="w-56 h-56 bg-white p-3 rounded-2xl mx-auto shadow-2xl flex items-center justify-center">
                <QRCodeSVG
                  value={joinUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="bg-[#24133b] p-3 rounded-xl border border-fuchsia-500/30 text-center font-retro-mono">
                <span className="text-[11px] text-zinc-400 block">PIN de la mesa:</span>
                <span className="text-3xl font-black text-white tracking-widest">{room.code}</span>
              </div>

              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar QR
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TEACHER PRE-GAME CONFIGURATION MODAL (PÓKER DEL OCTETO) */}
      <AnimatePresence>
        {isTeacherConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#140b24] border-2 border-emerald-500/70 p-5 sm:p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl text-xs font-sans text-zinc-200 max-h-[90dvh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-emerald-400" />
                  <h3 className="font-medieval text-base font-bold text-amber-300">
                    Configuraciones del Docente · Póker del Octeto
                  </h3>
                </div>
                <button
                  onClick={() => setIsTeacherConfigOpen(false)}
                  aria-label="Cerrar configuración"
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* 1. Fichas Iniciales por Estudiante */}
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300 block">
                  💰 Fichas Iniciales por Estudiante / Químico
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[500, 1000, 2500, 5000].map((chips) => (
                    <button
                      key={chips}
                      type="button"
                      onClick={() => {
                        playBalatroSound('select');
                        setLocalChips(chips);
                        onSelectStartingChips?.(chips);
                      }}
                      className={`py-2 px-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                        localChips === chips
                          ? 'bg-amber-500 text-zinc-950 border-amber-400'
                          : 'bg-[#1e1133] border-zinc-700 text-zinc-300 hover:text-white'
                      }`}
                    >
                      ${chips.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Cantidad de Bots IA en la Mesa */}
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                <label className="text-[11px] font-bold text-cyan-300 block">
                  🤖 Cantidad de Bots IA Químicos en la Mesa
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        playBalatroSound('select');
                        onSetBotCount(cnt);
                      }}
                      className={`py-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                        botPlayers.length === cnt
                          ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                          : 'bg-[#1e1133] border-zinc-700 text-zinc-300 hover:text-white'
                      }`}
                    >
                      {cnt} {cnt === 1 ? 'Bot' : 'Bots'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Límite de Apuesta por Ronda & Ciega Inicial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold text-fuchsia-300 block">
                    📈 Tope de Subida por Ronda
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { v: 150, label: '$150' },
                      { v: 300, label: '$300 (Est.)' },
                      { v: 500, label: '$500' },
                      { v: 0, label: 'All-In Libre' },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setBetCapLimit(opt.v)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          betCapLimit === opt.v
                            ? 'bg-fuchsia-500 text-white border-fuchsia-400'
                            : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold text-emerald-300 block">
                    🎯 Apuesta Base Inicial (Ciega)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { v: 0, label: '$0 (Libre)' },
                      { v: 25, label: '$25 Fichas' },
                      { v: 50, label: '$50 Fichas' },
                      { v: 100, label: '$100 Fichas' },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setBlindAmount(opt.v)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          blindAmount === opt.v
                            ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                            : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Asistente Químico & Tiempo por Turno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold text-amber-300 block">
                    🧪 Asistente de Enlaces Químicos
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setChemicalHintsEnabled(true)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                        chemicalHintsEnabled
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                          : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                      }`}
                    >
                      🧪 Pistas ON
                    </button>
                    <button
                      type="button"
                      onClick={() => setChemicalHintsEnabled(false)}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                        !chemicalHintsEnabled
                          ? 'bg-rose-600 text-white border-rose-400'
                          : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                      }`}
                    >
                      📝 Modo Examen
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-300 block">
                    🏆 Bonificación al Ganador
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[100, 200, 300].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setWinnerBonusPts(pts)}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer ${
                          winnerBonusPts === pts
                            ? 'bg-purple-500 text-white border-purple-400'
                            : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                        }`}
                      >
                        +{pts} pts
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Reloj de Decisión por Turno */}
              <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800 space-y-1.5">
                <label className="text-[11px] font-bold text-cyan-300 block">
                  ⏱️ Tiempo Límite de Decisión por Turno
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { v: 0, label: 'Sin límite' },
                    { v: 20, label: '20 seg' },
                    { v: 30, label: '30 seg' },
                    { v: 45, label: '45 seg' },
                  ].map((t) => (
                    <button
                      key={t.v}
                      type="button"
                      onClick={() => setTurnTimerSecs(t.v)}
                      className={`py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer ${
                        turnTimerSecs === t.v
                          ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                          : 'bg-[#1e1133] border-zinc-700 text-zinc-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playBalatroSound('play');
                  localStorage.setItem(
                    'po_poker_teacher_config',
                    JSON.stringify({
                      startingChips: localChips,
                      betCapLimit,
                      blindAmount,
                      chemicalHintsEnabled,
                      winnerBonusPts,
                      turnTimerSecs,
                    })
                  );
                  setIsTeacherConfigOpen(false);
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl cursor-pointer shadow-lg transition-colors"
              >
                Guardar y Aplicar Configuraciones del Docente
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
