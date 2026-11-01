import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { KeyRound, CheckCircle2, Mail } from 'lucide-react';
import { PokerCompendiumModal } from './PokerCompendiumModal';
import { SilhouetteColossusArt, RunicSigilsRow, DiamondRankBadge } from './SilhouetteColossusArt';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import {
  initAuth,
  signInWithGoogle,
  linkGoogleEmailDirectly,
  logoutGoogle,
  getCachedGoogleUser,
  getOrCreateDeviceUid,
  GoogleUserSession,
} from '../lib/firebaseAuth';

interface StudentJoinHubProps {
  initialCode?: string;
  playerName: string;
  playerAvatar: string;
  onUpdatePlayerInfo: (name: string, avatar: string) => void;
  onJoinRoom: (code: string, name: string, avatar: string, googleEmail?: string, googleUid?: string) => void;
  onStartSoloPractice: (gameType?: 'poker_quimico' | 'escape_room' | 'cien_latinos' | 'el_impostor' | 'geografia_3d') => void;
  onOpenGrimorio: () => void;
  onOpenLatinosLibrary?: () => void;
  onOpenEscapeLibrary?: () => void;
  onOpenImpostorLibrary?: () => void;
}

const AVATARS = [
  { emoji: '🧑‍🎓', label: 'Estudiante' },
  { emoji: '👩‍🎓', label: 'Alumna' },
  { emoji: '🔬', label: 'Científico' },
  { emoji: '🚀', label: 'Explorador' },
  { emoji: '🧠', label: 'Mente Ágil' },
  { emoji: '⚡', label: 'Física' },
  { emoji: '🧬', label: 'Biología' },
  { emoji: '🏆', label: 'Campeón' },
];

export const StudentJoinHub: React.FC<StudentJoinHubProps> = ({
  initialCode = '',
  playerName,
  playerAvatar,
  onUpdatePlayerInfo,
  onJoinRoom,
  onStartSoloPractice,
  onOpenGrimorio,
  onOpenLatinosLibrary,
  onOpenEscapeLibrary,
  onOpenImpostorLibrary,
}) => {
  const [code, setCode] = useState(initialCode);
  const [nameInput, setNameInput] = useState(playerName);
  const [avatarInput, setAvatarInput] = useState(playerAvatar);

  const [googleUser, setGoogleUser] = useState<GoogleUserSession | null>(() => getCachedGoogleUser());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showDirectEmail, setShowDirectEmail] = useState(false);
  const [directEmail, setDirectEmail] = useState('');
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false);

  useEffect(() => {
    const unsub = initAuth((user) => {
      setGoogleUser(user);
      if (user.displayName && (!nameInput || nameInput === 'Marie Curie')) {
        setNameInput(user.displayName);
        onUpdatePlayerInfo(user.displayName, avatarInput);
      }
    });
    return () => unsub();
  }, []);

  const handleGoogleConnect = async () => {
    setIsSigningIn(true);
    try {
      const user = await signInWithGoogle();
      setGoogleUser(user);
      setShowDirectEmail(false);
      if (user.displayName) {
        setNameInput(user.displayName);
        onUpdatePlayerInfo(user.displayName, avatarInput);
      }
      playBalatroSound('select');
    } catch {
      setShowDirectEmail(true);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDirectEmailSave = () => {
    const clean = directEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return;
    const session = linkGoogleEmailDirectly(clean, nameInput);
    setGoogleUser(session);
    setShowDirectEmail(false);
    playBalatroSound('select');
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    let activeUser = googleUser;
    if (!activeUser && directEmail.trim().includes('@')) {
      activeUser = linkGoogleEmailDirectly(directEmail.trim(), nameInput);
      setGoogleUser(activeUser);
    }
    const finalName = nameInput.trim() || 'Estudiante';
    playBalatroSound('play');
    onUpdatePlayerInfo(finalName, avatarInput);
    onJoinRoom(
      code.trim().toUpperCase(),
      finalName,
      avatarInput,
      activeUser?.email || undefined,
      activeUser?.uid || getOrCreateDeviceUid()
    );
  };

  const handleAvatarChange = (emoji: string) => {
    playBalatroSound('select');
    setAvatarInput(emoji);
    onUpdatePlayerInfo(nameInput, emoji);
  };

  return (
    <div className="w-full">
      {/* =====================================================================
          SECCIÓN SUPERIOR CLARA (#f0f0f2)
          1. Unirse a la Sala de Clase (PIN)
          2. 100 Latinos Dicen
          3. Escape Room (10 Cámaras)
      ===================================================================== */}
      <div className="w-full bg-[#f0f0f2] text-[#27272a] relative overflow-hidden pb-16">
        <svg
          className="absolute right-8 top-20 w-80 h-80 text-zinc-300/35 pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
        >
          <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
          <polygon points="100,15 185,100 100,185 15,100" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="32" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-20 relative z-10">
          {/* -----------------------------------------------------------------
              UNIRSE A LA SALA DE CLASE (CÓDIGO PIN)
          ----------------------------------------------------------------- */}
          <div className="bg-white/90 border border-zinc-300/90 p-6 sm:p-8 shadow-[0_12px_35px_rgba(0,0,0,0.04)] relative">
            <span className="w-2.5 h-2.5 border-t-2 border-l-2 border-[#9e1b24] absolute top-2 left-2" />
            <span className="w-2.5 h-2.5 border-t-2 border-r-2 border-[#9e1b24] absolute top-2 right-2" />
            <span className="w-2.5 h-2.5 border-b-2 border-l-2 border-[#9e1b24] absolute bottom-2 left-2" />
            <span className="w-2.5 h-2.5 border-b-2 border-r-2 border-[#9e1b24] absolute bottom-2 right-2" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-200 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#9e1b24] font-serif text-xs tracking-[0.2em] uppercase font-bold">
                    AULA EN VIVO
                  </span>
                  <span className="text-zinc-400">✕</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl tracking-[0.1em] uppercase text-zinc-900 font-bold mt-0.5">
                  Unirse a la Sala de Clase
                </h2>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Ingresa el código PIN proyectado por tu profesor en la pizarra para entrar a la partida.
                </p>
              </div>

              {/* Google Account Status / Link Button */}
              <div className="w-full md:w-auto">
                {googleUser ? (
                  <div className="px-3 py-1.5 bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#10b981] shrink-0" />
                    <span className="truncate max-w-[170px] font-medium">{googleUser.email}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        await logoutGoogle();
                        setGoogleUser(null);
                      }}
                      className="text-[10px] text-[#9e1b24] hover:underline ml-1 cursor-pointer uppercase tracking-wider font-semibold"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : !showDirectEmail ? (
                  <div className="flex flex-col md:items-end gap-1">
                    <button
                      type="button"
                      onClick={handleGoogleConnect}
                      disabled={isSigningIn}
                      className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>{isSigningIn ? 'Conectando...' : 'Vincular Google'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDirectEmail(true)}
                      className="text-[10px] text-zinc-500 hover:text-zinc-800 underline cursor-pointer"
                    >
                      O escribir correo institucional
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-300 p-1">
                    <Mail size={13} className="text-zinc-500 ml-1 shrink-0" />
                    <input
                      type="email"
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleDirectEmailSave();
                        }
                      }}
                      placeholder="alumno@colegio.edu"
                      className="bg-transparent text-xs text-zinc-800 px-1 py-0.5 focus:outline-none w-36"
                    />
                    <button
                      type="button"
                      onClick={handleDirectEmailSave}
                      className="px-2 py-0.5 bg-[#9e1b24] text-white text-[10px] font-bold uppercase cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 flex items-center gap-3 bg-[#f7f7f8] border border-zinc-300 px-4 py-2.5">
                  <KeyRound size={18} className="text-[#9e1b24] shrink-0" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="CÓDIGO PIN DE LA SALA"
                    maxLength={10}
                    className="w-full bg-transparent font-serif text-lg sm:text-xl font-bold tracking-[0.22em] text-zinc-900 focus:outline-none placeholder:text-zinc-400 uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!code.trim()}
                  className="flex items-center justify-center gap-3 bg-[#27272a] hover:bg-[#18181b] disabled:opacity-40 text-white text-xs tracking-[0.18em] uppercase font-semibold pr-6 pl-2 py-3 transition-all cursor-pointer shrink-0"
                >
                  <span className="w-6 h-6 bg-[#9e1b24] text-white flex items-center justify-center text-[10px]">
                    ▼
                  </span>
                  <span>Unirse a la Sala</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[10px] tracking-[0.16em] uppercase text-zinc-500 font-semibold block mb-1.5">
                    Tu Nombre de Estudiante:
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      onUpdatePlayerInfo(e.target.value, avatarInput);
                    }}
                    maxLength={18}
                    className="w-full bg-[#f7f7f8] border border-zinc-300 px-3 py-1.5 text-xs text-zinc-900 font-medium focus:outline-none focus:border-[#9e1b24]"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.16em] uppercase text-zinc-500 font-semibold block mb-1.5">
                    Elige tu Avatar:
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {AVATARS.map((item) => (
                      <button
                        key={item.emoji}
                        type="button"
                        onClick={() => handleAvatarChange(item.emoji)}
                        className={cn(
                          'w-8 h-8 flex items-center justify-center text-base border transition-all shrink-0 cursor-pointer',
                          avatarInput === item.emoji
                            ? 'bg-[#27272a] text-white border-[#9e1b24] scale-105'
                            : 'bg-[#f7f7f8] border-zinc-300 text-zinc-800 hover:bg-zinc-200'
                        )}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* -----------------------------------------------------------------
              1. 100 LATINOS DICEN (Ilustración Izquierda, Info Derecha)
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="md:col-span-7 flex justify-center"
            >
              <SilhouetteColossusArt
                variant="sunset_crimson"
                className="w-full max-w-[440px] h-[420px] sm:h-[460px]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="md:col-span-5 flex flex-col items-start md:items-end md:text-right"
            >
              <div className="flex items-center gap-2.5 border-b border-zinc-400/80 pb-1.5 w-full md:justify-end">
                <h2 className="font-serif text-xl sm:text-2xl tracking-[0.12em] font-bold text-[#9e1b24] uppercase">
                  100 LATINOS DICEN
                </h2>
                <span className="text-zinc-800 text-lg font-light leading-none">✕</span>
              </div>

              <p className="text-xs font-serif font-semibold text-zinc-700 tracking-wide mt-1.5">
                POR EQUIPOS
              </p>

              <p className="text-xs leading-relaxed text-zinc-600 mt-3 max-w-xs">
                Juega por equipos o explora la biblioteca de encuestas creada por toda la comunidad.
              </p>

              <div className="w-40 h-px bg-zinc-300 my-3.5" />

              <RunicSigilsRow theme="light" align="right" />

              <div className="flex items-center gap-3 mt-5">
                <div className="leading-none">
                  <div className="font-serif text-lg sm:text-xl tracking-[0.14em] text-zinc-800 uppercase font-semibold">
                    100 LATINOS
                  </div>
                  <div className="font-serif text-lg sm:text-xl tracking-[0.14em] text-zinc-800 uppercase font-semibold mt-0.5">
                    DICEN
                  </div>
                </div>
                <DiamondRankBadge numeral="I" theme="light" />
              </div>

              <div className="w-48 h-px bg-zinc-300 my-3" />

              <div className="mt-4 flex flex-wrap md:justify-end gap-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onStartSoloPractice('cien_latinos');
                  }}
                  className="flex items-center gap-2.5 bg-[#27272a] hover:bg-[#18181b] text-white text-[11px] tracking-wider uppercase font-medium pr-4 pl-1.5 py-1.5 transition-all cursor-pointer"
                >
                  <span className="w-5 h-5 bg-[#9e1b24] text-white flex items-center justify-center text-[9px]">
                    ▼
                  </span>
                  <span>Jugar Tablero</span>
                </button>

                {onOpenLatinosLibrary && (
                  <button
                    type="button"
                    onClick={() => {
                      playBalatroSound('click');
                      onOpenLatinosLibrary();
                    }}
                    className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-[11px] tracking-wider uppercase font-medium px-3 py-1.5 transition-all cursor-pointer"
                  >
                    <span>Buscar en Biblioteca</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* -----------------------------------------------------------------
              2. ESCAPE ROOM (10 CÁMARAS) (Info Izquierda, Ilustración Derecha)
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="md:col-span-5 order-2 md:order-1 flex flex-col items-start text-left"
            >
              <div className="flex items-center gap-2.5 border-b border-zinc-400/80 pb-1.5 w-full">
                <span className="text-zinc-800 text-lg font-light leading-none">✕</span>
                <h2 className="font-serif text-xl sm:text-2xl tracking-[0.12em] font-bold text-[#9e1b24] uppercase">
                  ESCAPE ROOM (10 CÁMARAS)
                </h2>
              </div>

              <p className="text-xs font-serif font-semibold text-zinc-700 tracking-wide mt-1.5">
                10 CÁMARAS
              </p>

              <p className="text-xs leading-relaxed text-zinc-600 mt-3 max-w-xs">
                Entrena contrarreloj resolviendo 10 acertijos con códigos de desbloqueo temáticos.
              </p>

              <div className="w-40 h-px bg-zinc-300 my-3.5" />

              <RunicSigilsRow theme="light" align="left" />

              <div className="flex items-center gap-3 mt-5">
                <DiamondRankBadge numeral="II" theme="light" />
                <div className="leading-none">
                  <div className="font-serif text-lg sm:text-xl tracking-[0.14em] text-zinc-800 uppercase font-semibold">
                    ESCAPE ROOM
                  </div>
                  <div className="font-serif text-lg sm:text-xl tracking-[0.14em] text-zinc-800 uppercase font-semibold mt-0.5">
                    10 CÁMARAS
                  </div>
                </div>
              </div>

              <div className="w-48 h-px bg-zinc-300 my-3" />

              <div className="mt-4 flex flex-wrap items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onStartSoloPractice('escape_room');
                  }}
                  className="flex items-center gap-2.5 bg-[#27272a] hover:bg-[#18181b] text-white text-[11px] tracking-wider uppercase font-medium pr-4 pl-1.5 py-1.5 transition-all cursor-pointer"
                >
                  <span className="w-5 h-5 bg-[#0284c7] text-white flex items-center justify-center text-[9px]">
                    ▼
                  </span>
                  <span>Practicar (10 Cámaras)</span>
                </button>

                {onOpenEscapeLibrary && (
                  <button
                    type="button"
                    onClick={() => {
                      playBalatroSound('click');
                      onOpenEscapeLibrary();
                    }}
                    className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-[11px] tracking-wider uppercase font-medium px-3 py-1.5 transition-all cursor-pointer"
                  >
                    <span>Biblioteca de Escape</span>
                  </button>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="md:col-span-7 order-1 md:order-2 flex justify-center"
            >
              <SilhouetteColossusArt
                variant="azure_cobalt"
                className="w-full max-w-[440px] h-[420px] sm:h-[460px]"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          TRANSICIÓN DIAGONAL CON JINETE EN SILUETA (#f0f0f2 -> #0e0c15)
      ===================================================================== */}
      <div className="relative w-full bg-[#f0f0f2] leading-none select-none overflow-hidden -mt-6">
        <svg
          viewBox="0 0 1440 190"
          className="w-full h-24 sm:h-36 md:h-44 block"
          preserveAspectRatio="none"
        >
          <polygon points="0,155 1440,55 1440,195 0,195" fill="#0e0c15" />
        </svg>

        <svg
          viewBox="0 0 220 140"
          className="w-28 sm:w-40 md:w-48 h-auto absolute left-6 sm:left-16 bottom-3 sm:bottom-5 pointer-events-none"
        >
          <g fill="#0e0c15">
            <path d="M55 106 L38 132 L44 134 L64 110 Z" />
            <path d="M68 106 L58 134 L65 135 L76 108 Z" />
            <path d="M126 98 L144 126 L138 129 L118 102 Z" />
            <path d="M135 95 L162 114 L156 119 L129 100 Z" />
            <path d="M52 92 C65 78, 108 76, 134 84 L158 58 L174 66 L166 76 L146 74 L138 98 C110 108, 72 108, 52 92 Z" />
            <path d="M54 90 C34 86, 18 96, 8 108 C24 104, 40 102, 54 96 Z" />
            <path d="M88 82 L94 48 L108 50 L104 82 Z" />
            <circle cx="101" cy="40" r="6" />
            <path d="M92 52 C74 48, 56 54, 44 64 C62 62, 78 60, 92 60 Z" />
            <path d="M84 22 L114 68" stroke="#0e0c15" strokeWidth="2.5" />
            <path d="M106 26 C122 36, 124 52, 114 66" stroke="#0e0c15" strokeWidth="2" fill="none" />
          </g>
        </svg>
      </div>

      {/* =====================================================================
          SECCIÓN INFERIOR OSCURA (#0e0c15)
          3. Póker del Octeto
          4. El Impostor (Estilo "Among Us" / "Dos verdades y una mentira") + Manuales
      ===================================================================== */}
      <div className="w-full bg-[#0e0c15] text-zinc-100 relative overflow-hidden pt-10 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-24 relative z-10">
          {/* -----------------------------------------------------------------
              3. PÓKER DEL OCTETO (Info Izquierda, Ilustración Derecha)
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="md:col-span-5 order-2 md:order-1 flex flex-col items-start text-left"
            >
              <div className="flex items-center gap-2.5 pb-1.5 w-full">
                <span className="text-[#22e584] text-lg font-light leading-none">✕</span>
                <h2 className="font-serif text-xl sm:text-2xl tracking-[0.12em] font-bold text-[#22e584] uppercase">
                  PÓKER DEL OCTETO
                </h2>
              </div>

              <p className="text-xs font-serif text-zinc-200 tracking-wide mt-1">
                MOLÉCULAS Y CARTAS
              </p>

              <p className="text-xs leading-relaxed text-zinc-400 mt-3 max-w-xs">
                Practica enlaces químicos y la regla del octeto formando moléculas con cartas de elementos.
              </p>

              <div className="flex items-center gap-3 mt-6">
                <DiamondRankBadge numeral="III" theme="dark" />
                <div className="leading-none">
                  <div className="font-serif text-lg sm:text-xl tracking-[0.14em] text-[#22e584] uppercase font-semibold">
                    PÓKER DEL OCTETO
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onStartSoloPractice('poker_quimico');
                  }}
                  className="flex items-center gap-3 bg-[#25242c] hover:bg-[#31303a] text-zinc-200 text-[11px] tracking-wider uppercase pr-4 pl-1.5 py-1.5 border border-zinc-700/70 transition-all cursor-pointer"
                >
                  <span className="w-5 h-5 bg-[#10b981] text-[#0e0c15] font-bold flex items-center justify-center text-[9px]">
                    ▼
                  </span>
                  <span>Practicar con Bots</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('click');
                    setIsCompendiumOpen(true);
                  }}
                  className="flex items-center gap-2 bg-[#1a1822] hover:bg-[#25242c] text-zinc-300 text-[11px] tracking-wider uppercase px-3 py-1.5 border border-zinc-800 transition-all cursor-pointer"
                >
                  <span>Cartas y Reglas de Jerarquía</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="md:col-span-7 order-1 md:order-2 flex justify-center"
            >
              <SilhouetteColossusArt
                variant="violet_knight"
                className="w-full max-w-[440px] h-[420px] sm:h-[460px]"
              />
            </motion.div>
          </div>

          {/* -----------------------------------------------------------------
              4. EL IMPOSTOR + GUÍAS Y FÓRMULAS (Ilustración Izquierda, Info Derecha)
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="md:col-span-7 flex justify-center"
            >
              <SilhouetteColossusArt
                variant="emerald_abyss"
                className="w-full max-w-[440px] h-[420px] sm:h-[460px]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="md:col-span-5 flex flex-col items-start md:items-end md:text-right"
            >
              <div className="flex items-center gap-2.5 pb-1.5 w-full md:justify-end">
                <h2 className="font-serif text-xl sm:text-2xl tracking-[0.12em] font-bold text-[#22e584] uppercase">
                  EL IMPOSTOR
                </h2>
                <span className="text-[#22e584] text-lg font-light leading-none">✕</span>
              </div>

              <p className="text-xs font-serif text-zinc-200 tracking-wide mt-1">
                ESTILO "AMONG US" · VERDADES Y UNA MENTIRA
              </p>

              <p className="text-xs leading-relaxed text-zinc-400 mt-3 max-w-xs">
                Analiza 4 afirmaciones o fórmulas donde todas son correctas excepto una con un error sutil. Debate, vota para expulsar al impostor y justifica tu decisión.
              </p>

              <div className="flex items-center gap-3 mt-6">
                <div className="leading-none">
                  <div className="font-serif text-lg sm:text-xl tracking-[0.14em] text-[#22e584] uppercase font-semibold">
                    DEBATE Y
                  </div>
                  <div className="font-serif text-lg sm:text-xl tracking-[0.14em] text-[#22e584] uppercase font-semibold mt-0.5">
                    PENSAMIENTO CRÍTICO
                  </div>
                </div>
                <DiamondRankBadge numeral="IV" theme="dark" />
              </div>

              <div className="mt-5 flex flex-wrap md:justify-end items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onStartSoloPractice('el_impostor');
                  }}
                  className="flex items-center gap-3 bg-[#25242c] hover:bg-[#31303a] text-zinc-200 text-[11px] tracking-wider uppercase pl-4 pr-1.5 py-1.5 border border-zinc-700/70 transition-all cursor-pointer"
                >
                  <span>Jugar El Impostor</span>
                  <span className="w-5 h-5 bg-[#10b981] text-[#0e0c15] font-bold flex items-center justify-center text-[9px]">
                    ▼
                  </span>
                </button>

                {onOpenImpostorLibrary && (
                  <button
                    type="button"
                    onClick={() => {
                      playBalatroSound('click');
                      onOpenImpostorLibrary();
                    }}
                    className="flex items-center gap-2 bg-[#1a1822] hover:bg-[#25242c] text-zinc-300 text-[11px] tracking-wider uppercase px-3 py-1.5 border border-zinc-800 transition-all cursor-pointer"
                  >
                    <span>🕵️ Biblioteca de Impostor</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('click');
                    onOpenGrimorio();
                  }}
                  className="flex items-center gap-2 bg-[#1a1822] hover:bg-[#25242c] text-zinc-300 text-[11px] tracking-wider uppercase px-3 py-1.5 border border-zinc-800 transition-all cursor-pointer"
                >
                  <span>📖 Guías y Fórmulas</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* -----------------------------------------------------------------
              5. GLOBO TERRÁQUEO 3D: GEOGRAFÍA INTERACTIVA (Info Izquierda, Ilustración Derecha)
          ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="md:col-span-5 order-2 md:order-1 flex flex-col items-start text-left"
            >
              <div className="flex items-center gap-2.5 pb-1.5 w-full">
                <span className="text-[#22e584] text-lg font-light leading-none">✕</span>
                <h2 className="font-serif text-xl sm:text-2xl tracking-[0.12em] font-bold text-[#22e584] uppercase">
                  GLOBO TERRÁQUEO 3D
                </h2>
              </div>

              <p className="text-xs font-serif text-zinc-200 tracking-wide mt-1">
                ADIVINA EL PAÍS · LOCALIZA EN EL GLOBO 3D
              </p>

              <p className="text-xs leading-relaxed text-zinc-400 mt-3 max-w-xs">
                Gira el planeta Tierra en 3D con el mouse o dedo, haz zoom sobre las fronteras y pon a prueba tu racha en "Adivina el País" (Opción Múltiple o Escritura Libre) y "Localiza el País".
              </p>

              <div className="flex items-center gap-3 mt-6">
                <DiamondRankBadge numeral="V" theme="dark" />
                <div className="leading-none">
                  <div className="font-serif text-lg sm:text-xl tracking-[0.14em] text-[#22e584] uppercase font-semibold">
                    GEOGRAFÍA MUNDIAL
                  </div>
                  <div className="font-serif text-lg sm:text-xl tracking-[0.14em] text-[#22e584] uppercase font-semibold mt-0.5">
                    GLOBO 3D
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playBalatroSound('play');
                    onStartSoloPractice('geografia_3d');
                  }}
                  className="flex items-center gap-3 bg-[#25242c] hover:bg-[#31303a] text-zinc-200 text-[11px] tracking-wider uppercase pr-4 pl-1.5 py-1.5 border border-zinc-700/70 transition-all cursor-pointer"
                >
                  <span className="w-5 h-5 bg-[#10b981] text-[#0e0c15] font-bold flex items-center justify-center text-[9px]">
                    ▼
                  </span>
                  <span>Jugar Geografía 3D</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="md:col-span-7 order-1 md:order-2 flex justify-center"
            >
              <SilhouetteColossusArt
                variant="golden_atlas"
                className="w-full max-w-[440px] h-[420px] sm:h-[460px]"
              />
            </motion.div>
          </div>
        </div>
      </div>

      <PokerCompendiumModal
        isOpen={isCompendiumOpen}
        onClose={() => setIsCompendiumOpen(false)}
      />
    </div>
  );
};
