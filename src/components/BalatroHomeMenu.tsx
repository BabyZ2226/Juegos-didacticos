import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, RefreshCw } from 'lucide-react';
import { PixelGrimoireModal, GrimoireTab } from './PixelGrimoireModal';
import { TeacherGameCatalog } from './TeacherGameCatalog';
import { StudentJoinHub } from './StudentJoinHub';
import { RoleSelectionModal } from './RoleSelectionModal';
import { LatinosLibraryModal } from './LatinosLibraryModal';
import { EscapeRoomLibraryModal } from './EscapeRoomLibraryModal';
import { ImpostorLibraryModal } from './ImpostorLibraryModal';
import { MatchHistoryModal } from './MatchHistoryModal';
import { ProfileModal } from './ProfileModal';
import { AulaPlayLogo } from './AulaPlayLogo';
import { playBalatroSound } from '../lib/soundEffects';
import { cn } from '../lib/utils';
import { EducationalGameType, LatinoGamePack, EscapeRoomPack, ImpostorGamePack } from '../types';

interface BalatroHomeMenuProps {
  userRole: 'teacher' | 'student' | null;
  onSelectRole: (role: 'teacher' | 'student') => void;
  playerName: string;
  playerAvatar: string;
  onUpdatePlayerInfo: (name: string, avatar: string) => void;
  soloBotCount: number;
  onSelectBotCount: (count: number) => void;
  startingChips?: number;
  onSelectStartingChips?: (chips: number) => void;
  onSelectGameType?: (gameType: EducationalGameType, presetRoomName?: string) => void;
  onStartSolo: (botCount: number, gameType?: EducationalGameType, initialLatinosPack?: LatinoGamePack, initialEscapePack?: EscapeRoomPack, initialImpostorPack?: ImpostorGamePack) => void;
  onOpenMultiplayer: (mode?: 'create' | 'join') => void;
  onOpenDeckLab: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onGoLanding?: () => void;
  onCreateRoom?: (playerName: string, avatar: string, botCount: number, maxPlayers: number, roomName?: string) => void;
  onJoinRoom?: (roomCode: string, playerName: string, avatar: string, googleEmail?: string, googleUid?: string) => void;
}

export const BalatroHomeMenu: React.FC<BalatroHomeMenuProps> = ({
  userRole,
  onSelectRole,
  playerName,
  playerAvatar,
  onUpdatePlayerInfo,
  soloBotCount,
  onSelectBotCount,
  startingChips = 1000,
  onSelectStartingChips,
  onSelectGameType,
  onStartSolo,
  onOpenMultiplayer,
  onOpenDeckLab,
  onOpenRules,
  onGoLanding,
  onCreateRoom,
  onJoinRoom,
}) => {
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  const [grimoireTab, setGrimoireTab] = useState<GrimoireTab>('play');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(userRole === null);
  const [isLatinosLibraryOpen, setIsLatinosLibraryOpen] = useState(false);
  const [isEscapeLibraryOpen, setIsEscapeLibraryOpen] = useState(false);
  const [isImpostorLibraryOpen, setIsImpostorLibraryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  React.useEffect(() => {
    if (userRole === null) {
      setIsRoleModalOpen(true);
    }
  }, [userRole]);

  const handleSoundClick = (type: 'hover' | 'click' | 'play' | 'deal' | 'bubble' | 'select') => {
    playBalatroSound(type);
  };

  const openGrimoire = (tab: GrimoireTab) => {
    handleSoundClick('click');
    if (tab === 'profile') {
      setIsProfileModalOpen(true);
      return;
    }
    setGrimoireTab(tab);
    setIsGrimoireOpen(true);
  };

  const handleRoleChange = (newRole: 'teacher' | 'student') => {
    onSelectRole(newRole);
    setIsRoleModalOpen(false);
  };

  return (
    <div className="relative w-full h-full min-h-screen overflow-y-auto bg-[#0e0c15] text-[#27272a] select-none flex flex-col justify-between font-sans">
      {/* 1. Barra Superior Oscura (#1c1c1e) */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 bg-[#1c1c1e] border-b border-zinc-800 text-zinc-100">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6d28d9] via-[#9333ea] to-[#c084fc] flex items-center justify-center text-xs font-black text-white shadow-sm">
            🧭
          </div>
          <div className="flex flex-col">
            <AulaPlayLogo size="sm" theme="light" />
            <span className="text-[9px] tracking-[0.18em] text-zinc-400 uppercase mt-0.5">
              Campamento & Bitácora Didáctica
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-3 text-[11px] tracking-[0.12em] uppercase">
          {onGoLanding && (
            <button
              type="button"
              onClick={() => {
                handleSoundClick('click');
                onGoLanding();
              }}
              className="px-3 py-1 text-zinc-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>🌐 Conoce</span>
              <AulaPlayLogo size="xs" theme="light" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              handleSoundClick('click');
              setIsHistoryOpen(true);
            }}
            className="px-3 py-1 text-zinc-300 hover:text-[#22e584] transition-colors cursor-pointer"
          >
            📊 Historial & Estadísticas
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              handleSoundClick('click');
              setIsRoleModalOpen(true);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 border text-[11px] tracking-[0.12em] uppercase transition-all cursor-pointer whitespace-nowrap',
              userRole === 'teacher'
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-[#9e1b24]'
                : 'bg-zinc-800 border-zinc-700 text-[#22e584] hover:border-[#22e584]'
            )}
            title="Cambiar entre modo Docente y Estudiante"
          >
            <span>
              {userRole === 'teacher' ? '👨‍🏫 Cuaderno Docente' : '🧑‍🎓 Cuaderno Estudiante'}
            </span>
            <RefreshCw size={10} className="opacity-70 ml-0.5 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => openGrimoire('profile')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-200 hover:border-zinc-500 transition-colors cursor-pointer whitespace-nowrap"
            title="Editar perfil"
          >
            <span>{playerAvatar || (userRole === 'teacher' ? '👨‍🏫' : '🧑‍🎓')}</span>
            <span className="truncate max-w-[90px] hidden sm:inline-block font-medium">
              {playerName || (userRole === 'teacher' ? 'Docente' : 'Estudiante')}
            </span>
          </button>
        </div>
      </header>

      {/* 2. Encabezado Principal en Alabastro (#f0f0f2) */}
      <div className="relative w-full bg-[#f0f0f2] pt-10 pb-12 px-4 overflow-hidden border-b border-zinc-200/60">
        <div
          className="absolute inset-x-0 top-0 h-48 pointer-events-none opacity-45"
          style={{
            background:
              'radial-gradient(ellipse at 65% 0%, rgba(161,161,170,0.45) 0%, rgba(240,240,242,0) 72%)',
          }}
        />

        <svg
          className="absolute right-0 top-0 w-96 h-48 text-zinc-400/25 pointer-events-none"
          viewBox="0 0 400 200"
          fill="currentColor"
        >
          <polygon points="180,0 400,0 400,160 280,90" />
          <polygon points="240,0 400,0 400,90" className="text-zinc-500/20" />
          <circle cx="290" cy="48" r="14" className="text-zinc-700/20" />
          <circle cx="290" cy="48" r="6" className="text-[#f0f0f2]" />
        </svg>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
          <div className="font-serif text-3xl sm:text-4xl font-bold text-[#9e1b24] tracking-[0.2em] leading-none">
            {userRole === 'teacher' ? 'I' : 'II'}
          </div>

          <h1 className="font-serif text-xl sm:text-3xl tracking-[0.18em] uppercase text-zinc-900 font-semibold mt-1.5">
            {userRole === 'teacher'
              ? 'Cuaderno del Docente: Salas y Actividades Didácticas'
              : 'Cuaderno del Estudiante: Aprende Jugando en Clase'}
          </h1>

          {/* Divisor con diamante central (───◇───) */}
          <div className="flex items-center justify-center w-64 sm:w-80 my-2.5">
            <div className="flex-1 h-px bg-zinc-400" />
            <div className="w-2.5 h-2.5 rotate-45 border border-zinc-600 bg-[#f0f0f2] mx-2" />
            <div className="flex-1 h-px bg-zinc-400" />
          </div>

          <p className="text-xs text-zinc-600 max-w-lg">
            {userRole === 'teacher'
              ? 'Abre salas en vivo con código PIN/QR para proyectar en el aula o explora las actividades del catálogo.'
              : 'Ingresa con el código PIN de tu profesor para unirte al juego en vivo, o entrena a tu propio ritmo.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
            {userRole === 'teacher' && (
              <button
                type="button"
                onClick={() => {
                  handleSoundClick('play');
                  onOpenMultiplayer('create');
                }}
                className="flex items-center gap-2 bg-[#27272a] hover:bg-[#18181b] text-white text-[11px] tracking-[0.14em] uppercase px-4 py-1.5 cursor-pointer transition-all"
              >
                <Plus size={13} className="text-[#9e1b24]" />
                <span>Crear Sala de Clase</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                handleSoundClick('click');
                setIsHistoryOpen(true);
              }}
              className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 text-[11px] tracking-[0.14em] uppercase px-3.5 py-1.5 cursor-pointer transition-all"
            >
              <span>📊 Historial y Estadísticas</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Contenido Principal (Catálogo Docente / Cuaderno Estudiante) */}
      <main className="relative z-20 flex-1 w-full">
        {userRole === 'teacher' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <TeacherGameCatalog
              onCreateRoomForGame={(gameType, presetRoomName) => {
                if (onSelectGameType) onSelectGameType(gameType, presetRoomName);
                onOpenMultiplayer('create');
              }}
              onPracticeSoloGame={(gameType) => {
                if (onSelectGameType) onSelectGameType(gameType);
                onStartSolo(soloBotCount, gameType);
              }}
              onOpenLatinosLibrary={() => setIsLatinosLibraryOpen(true)}
              onOpenEscapeLibrary={() => setIsEscapeLibraryOpen(true)}
              onOpenImpostorLibrary={() => setIsImpostorLibraryOpen(true)}
              onOpenDeckLab={onOpenDeckLab}
              onOpenRulesManual={onOpenRules}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <StudentJoinHub
              playerName={playerName}
              playerAvatar={playerAvatar}
              onUpdatePlayerInfo={onUpdatePlayerInfo}
              onJoinRoom={(code, pName, pAvatar, gEmail, gUid) => {
                if (onJoinRoom) {
                  onJoinRoom(code, pName, pAvatar, gEmail, gUid);
                } else {
                  onOpenMultiplayer('join');
                }
              }}
              onStartSoloPractice={(gt) => {
                const target = gt || 'escape_room';
                if (onSelectGameType) onSelectGameType(target);
                onStartSolo(soloBotCount, target);
              }}
              onOpenGrimorio={() => openGrimoire('collection')}
              onOpenLatinosLibrary={() => setIsLatinosLibraryOpen(true)}
              onOpenEscapeLibrary={() => setIsEscapeLibraryOpen(true)}
              onOpenImpostorLibrary={() => setIsImpostorLibraryOpen(true)}
            />
          </motion.div>
        )}
      </main>

      {/* 4. Pie de Página (#0a090f) */}
      <footer className="w-full bg-[#0a090f] text-zinc-400 py-8 px-4 sm:px-8 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] tracking-[0.12em] uppercase">
          <div className="flex items-center gap-2.5">
            <span>©</span>
            <AulaPlayLogo size="xs" theme="light" />
            <span>· Campamento de Juegos Didácticos de Enseñanza</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setIsEscapeLibraryOpen(true)}
              className="hover:text-[#22e584] transition-colors cursor-pointer"
            >
              🗝️ Biblioteca 10 Cámaras
            </button>
            <button
              type="button"
              onClick={() => setIsLatinosLibraryOpen(true)}
              className="hover:text-[#22e584] transition-colors cursor-pointer"
            >
              🎤 Biblioteca 100 Latinos
            </button>
            <button
              type="button"
              onClick={() => setIsImpostorLibraryOpen(true)}
              className="hover:text-[#22e584] transition-colors cursor-pointer"
            >
              🕵️ Biblioteca El Impostor
            </button>
            <button
              type="button"
              onClick={() => openGrimoire('rules')}
              className="hover:text-[#22e584] transition-colors cursor-pointer"
            >
              📜 Manuales y Guías
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Modales */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        currentRole={userRole}
        onSelectRole={handleRoleChange}
        onClose={userRole ? () => setIsRoleModalOpen(false) : undefined}
      />

      <PixelGrimoireModal
        isOpen={isGrimoireOpen}
        initialTab={grimoireTab}
        onClose={() => setIsGrimoireOpen(false)}
        soloBotCount={soloBotCount}
        onSelectBotCount={onSelectBotCount}
        startingChips={startingChips}
        onSelectStartingChips={onSelectStartingChips}
        onStartSolo={(count) => {
          setIsGrimoireOpen(false);
          if (onSelectGameType) onSelectGameType('poker_quimico');
          onStartSolo(count, 'poker_quimico');
        }}
        onCreateRoom={(pName, pAvatar, bCount, maxP, rName) => {
          setIsGrimoireOpen(false);
          if (onCreateRoom) {
            onCreateRoom(pName, pAvatar, bCount, maxP, rName);
          } else {
            onOpenMultiplayer('create');
          }
        }}
        onJoinRoom={(rCode, pName, pAvatar) => {
          setIsGrimoireOpen(false);
          if (onJoinRoom) {
            onJoinRoom(rCode, pName, pAvatar);
          } else {
            onOpenMultiplayer('join');
          }
        }}
      />

      <LatinosLibraryModal
        isOpen={isLatinosLibraryOpen}
        authorDefaultName={playerName || (userRole === 'teacher' ? 'Docente' : 'Estudiante')}
        onClose={() => setIsLatinosLibraryOpen(false)}
        onSelectPack={(pack) => {
          setIsLatinosLibraryOpen(false);
          if (onSelectGameType) onSelectGameType('cien_latinos', `100 Latinos: ${pack.title}`);
          onStartSolo(soloBotCount, 'cien_latinos', pack);
        }}
      />

      <EscapeRoomLibraryModal
        isOpen={isEscapeLibraryOpen}
        defaultAuthorName={playerName || (userRole === 'teacher' ? 'Docente' : 'Estudiante')}
        onClose={() => setIsEscapeLibraryOpen(false)}
        onSelectPack={(pack) => {
          setIsEscapeLibraryOpen(false);
          if (onSelectGameType) onSelectGameType('escape_room', pack.title);
          onStartSolo(soloBotCount, 'escape_room', undefined, pack);
        }}
      />

      <ImpostorLibraryModal
        isOpen={isImpostorLibraryOpen}
        defaultAuthorName={playerName || (userRole === 'teacher' ? 'Docente' : 'Estudiante')}
        onClose={() => setIsImpostorLibraryOpen(false)}
        onSelectPack={(pack) => {
          setIsImpostorLibraryOpen(false);
          if (onSelectGameType) onSelectGameType('el_impostor', pack.title);
          onStartSolo(soloBotCount, 'el_impostor', undefined, undefined, pack);
        }}
      />

      <MatchHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        userRole={userRole}
        currentStudentName={playerName}
      />

      {isProfileModalOpen && (
        <ProfileModal
          onClose={() => setIsProfileModalOpen(false)}
          onSaveProfile={onUpdatePlayerInfo}
        />
      )}
    </div>
  );
};
