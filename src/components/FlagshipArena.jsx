import React, { useState, useEffect } from 'react';
import OmniBoard3D from './OmniBoard3D';
import CryptexBox from './HardwareSimulators/CryptexBox';
import TutorialOverlay from './TutorialOverlay';
import { CpuAiEngine } from '../engine/CpuAiEngine';
import { LocalStorageManager } from '../engine/LocalStorageManager';
import { soundFx } from './SoundController';
import { 
  Flame, 
  Shield, 
  Zap, 
  Activity, 
  Target, 
  Layers, 
  RotateCcw, 
  Play, 
  Settings, 
  Award,
  Radio,
  Sun,
  Mountain,
  Crosshair,
  Sparkles,
  Heart,
  Anchor,
  HelpCircle,
  Volume2,
  VolumeX,
  Cpu,
  BookOpen,
  UserCheck,
  Bot
} from 'lucide-react';

const cpuAi = new CpuAiEngine();

export default function FlagshipArena({ soundEnabled, onObjectiveComplete }) {
  // Game Cycle State matching reference UI (Turn 14: Cycle 3)
  const [turn, setTurn] = useState(14);
  const [cycle, setCycle] = useState(3);
  const [activePhase, setActivePhase] = useState('ACTIONS');
  const [gameMode, setGameMode] = useState('VS_CPU'); // 'VS_CPU' or 'SOLO'
  const [isCpuTurn, setIsCpuTurn] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Hero Stats State
  const [heroStats, setHeroStats] = useState({
    name: 'PHOENIX RISING',
    status: 110,
    vitality: 72,
    resource: 50,
    anchor: 50,
    kinetic: 72,
    arcane: 95,
    level: 12
  });

  // Units State on 3D Omni-Board
  const [units, setUnits] = useState([
    { 
      id: 'phoenix', 
      name: 'PHOENIX RISING', 
      gx: 0, 
      gy: 14, // A15
      color: '#f97316', 
      accent: '#fbbf24', 
      hp: 88, 
      maxHp: 100, 
      level: 12, 
      role: 'Hero Champion',
      avatar: '🔥'
    },
    { 
      id: 'orlis', 
      name: 'ORLIS ARCHON', 
      gx: 7, 
      gy: 7, // G8
      color: '#06b6d4', 
      accent: '#67e8f9', 
      hp: 72, 
      maxHp: 100, 
      level: 'O-10', 
      role: 'Aether Archon',
      avatar: '🛡️'
    },
    { 
      id: 'void1', 
      name: 'VOID REAPER', 
      gx: 11, 
      gy: 3, // O4
      color: '#a855f7', 
      accent: '#e879f9', 
      hp: 110, 
      maxHp: 120, 
      level: 15, 
      role: 'Void Vanguard',
      avatar: '👾'
    },
    { 
      id: 'void2', 
      name: 'VOID TITAN', 
      gx: 13, 
      gy: 1, // O14
      color: '#c084fc', 
      accent: '#f0abfc', 
      hp: 95, 
      maxHp: 100, 
      level: 14, 
      role: 'Heavy Titan',
      avatar: '🤖'
    },
    { 
      id: 'mech1', 
      name: 'AETHER MECH', 
      gx: 4, 
      gy: 6, // D6/G7
      color: '#38bdf8', 
      accent: '#7dd3fc', 
      hp: 60, 
      maxHp: 80, 
      level: 8, 
      role: 'Support Mech',
      avatar: '⚡'
    }
  ]);

  // Selected Card & Action Log
  const [selectedCard, setSelectedCard] = useState(null);
  const [activeAbility, setActiveAbility] = useState(null);
  const [actionLog, setActionLog] = useState('TURN 14 STARTED: ACTIONS PHASE ACTIVE');
  const [floatingFx, setFloatingFx] = useState(null);

  // Load saved state from LocalStorage on mount
  useEffect(() => {
    const saved = LocalStorageManager.loadGameState();
    if (saved) {
      if (saved.turn) setTurn(saved.turn);
      if (saved.cycle) setCycle(saved.cycle);
      if (saved.activePhase) setActivePhase(saved.activePhase);
      if (saved.heroStats) setHeroStats(saved.heroStats);
      if (saved.units) setUnits(saved.units);
      if (saved.gameMode) setGameMode(saved.gameMode);
    }
  }, []);

  // Auto-save state to LocalStorage on updates
  useEffect(() => {
    LocalStorageManager.saveGameState({
      turn,
      cycle,
      activePhase,
      heroStats,
      units,
      actionLog,
      gameMode
    });
  }, [turn, cycle, activePhase, heroStats, units, actionLog, gameMode]);

  // Holographic 7-Force Card Hand Data
  const HOLOGRAPHIC_CARDS = [
    {
      id: 'phanta',
      name: 'PHANTA',
      icon: '🔥',
      color: 'border-amber-500/80 bg-amber-950/30 text-amber-400',
      glow: 'shadow-amber-500/30',
      costEnergy: 35,
      costWater: 19,
      desc: 'Synergistic fire strike dealing 35 Kinetic & 19 Arcane damage to target unit.'
    },
    {
      id: 'aether',
      name: 'AETHER',
      icon: '⚛️',
      color: 'border-cyan-400/80 bg-cyan-950/30 text-cyan-300',
      glow: 'shadow-cyan-400/30',
      costEnergy: 28,
      costWater: 15,
      desc: 'Phases spatial grid field to shield unit for 28 AP and restore 15 Vitality.'
    },
    {
      id: 'dynamo',
      name: 'DYNAMO',
      icon: '⚡',
      color: 'border-purple-500/80 bg-purple-950/30 text-purple-300',
      glow: 'shadow-purple-500/30',
      costEnergy: 23,
      costWater: 19,
      desc: 'Overcharges kinetic grid energy, dealing 23 chain damage to adjacent hexes.'
    },
    {
      id: 'valor',
      name: 'VALOR',
      icon: '🛡️',
      color: 'border-yellow-500/80 bg-yellow-950/30 text-yellow-300',
      glow: 'shadow-yellow-500/30',
      costEnergy: 23,
      costWater: 15,
      desc: 'Amplifies squad attack power by +23% and fortifies anchor defenses.'
    },
    {
      id: 'echo',
      name: 'ECHO',
      icon: '🔊',
      color: 'border-teal-400/80 bg-teal-950/30 text-teal-300',
      glow: 'shadow-teal-400/30',
      costEnergy: 23,
      costWater: 15,
      desc: 'Emits sonic harmonic frequency, copying previous card action effect.'
    },
    {
      id: 'gravity',
      name: 'GRAVITY',
      icon: '🌀',
      color: 'border-fuchsia-500/80 bg-fuchsia-950/30 text-fuchsia-300',
      glow: 'shadow-fuchsia-500/30',
      costEnergy: 29,
      costWater: 15,
      desc: 'Generates localized gravitational singularity pulling target 2 hexes closer.'
    },
    {
      id: 'quantum',
      name: 'QUANTUM',
      icon: '🌌',
      color: 'border-blue-500/80 bg-blue-950/30 text-blue-300',
      glow: 'shadow-blue-500/30',
      costEnergy: 26,
      costWater: 15,
      desc: 'Initiates quantum superposition, allowing unit to bypass terrain barriers.'
    }
  ];

  const HEX_ABILITIES = [
    { id: 'ab1', name: 'Aegis Shield', icon: Shield, color: 'text-amber-400 border-amber-500/50 bg-amber-950/40' },
    { id: 'ab2', name: 'Pulse Wave', icon: Activity, color: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40' },
    { id: 'ab3', name: 'Arcane Flare', icon: Sparkles, color: 'text-purple-400 border-purple-500/50 bg-purple-950/40' },
    { id: 'ab4', name: 'Kinetic Blast', icon: Zap, color: 'text-fuchsia-400 border-fuchsia-500/50 bg-fuchsia-950/40' },
    { id: 'ab5', name: 'Solar Crest', icon: Sun, color: 'text-yellow-400 border-yellow-500/50 bg-yellow-950/40' },
    { id: 'ab6', name: 'Slash Vector', icon: Flame, color: 'text-rose-400 border-rose-500/50 bg-rose-950/40' }
  ];

  const SQUARE_ABILITIES = [
    { id: 'sq1', name: 'Sun Core', icon: Sun },
    { id: 'sq2', name: 'Mountain Guard', icon: Mountain },
    { id: 'sq3', name: 'Fist Strike', icon: Target },
    { id: 'sq4', name: 'Grid Radar', icon: Radio },
    { id: 'sq5', name: 'Crosshair Aim', icon: Crosshair }
  ];

  // Handle Player Card Selection
  const handleCardClick = (card) => {
    if (soundEnabled) soundFx.playClick();

    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
      setActionLog('CARD DESELECTED');
    } else {
      setSelectedCard(card);
      setActionLog(`SELECTED CARD: [${card.name}] - SELECT TARGET ON OMNI-BOARD`);
    }
  };

  // Handle Player Tile Selection & Attack Execution
  const handleTileSelect = (tile) => {
    if (selectedCard) {
      if (soundEnabled) soundFx.playCompileSuccess();

      const targetUnit = units.find(u => u.gx === tile.x && u.gy === tile.y) || units[1];
      const dmg = selectedCard.costEnergy || 35;

      // Update target unit HP
      setUnits(prev => prev.map(u => u.id === targetUnit.id ? { ...u, hp: Math.max(0, u.hp - dmg) } : u));
      
      setFloatingFx({
        target: targetUnit.id,
        text: `-${dmg} KINETIC!`,
        color: '#38bdf8'
      });

      setActionLog(`EXECUTED [${selectedCard.name}] ON (${tile.x}, ${tile.y}). DEALT -${dmg} KINETIC DAMAGE!`);
      
      setHeroStats(prev => ({
        ...prev,
        resource: Math.max(0, prev.resource - 5),
        vitality: Math.min(100, prev.vitality + 2)
      }));

      setSelectedCard(null);
      if (onObjectiveComplete) onObjectiveComplete('obj-paninian-lifo-combo');
    } else {
      // Player movement
      setUnits(prev => prev.map(u => u.id === 'phoenix' ? { ...u, gx: tile.x, gy: tile.y } : u));
      setActionLog(`PHOENIX RISING MOVED TO COORDINATES (${tile.x}, ${tile.y})`);
    }
  };

  // Handle Triggering CPU Turn
  const triggerCpuTurn = () => {
    setIsCpuTurn(true);
    setActionLog('CHITRAGUPTA AI: THINKING & EVALUATING TACTICAL POSITIONS...');

    setTimeout(() => {
      const res = cpuAi.executeTurn(units, heroStats, {});
      setUnits(res.units);
      setHeroStats(res.playerStats);
      setFloatingFx(res.floatingFx);
      setActionLog(res.logs[res.logs.length - 1] || 'CPU TURN RESOLVED.');
      setIsCpuTurn(false);
    }, 1200);
  };

  // Handle End Turn
  const handleEndTurn = () => {
    if (soundEnabled) soundFx.playClick();

    if (cycle >= 4) {
      setTurn(prev => prev + 1);
      setCycle(1);
    } else {
      setCycle(prev => prev + 1);
    }

    setHeroStats(prev => ({ ...prev, resource: Math.min(100, prev.resource + 15) }));

    if (gameMode === 'VS_CPU') {
      triggerCpuTurn();
    } else {
      setActionLog(`TURN ${turn} CYCLE ${cycle}: TURN ENDED. RECHARGED +15 RESOURCE.`);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-slate-100 font-sans pb-10">
      
      {/* Tutorial Overlay Modal */}
      <TutorialOverlay 
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onStartPractice={() => setGameMode('VS_CPU')}
      />

      {/* ==================== TOP SYSTEM HEADER HUD ==================== */}
      <header className="flex flex-wrap items-center justify-between bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-amber-500/30 shadow-xl shadow-amber-950/20">
        
        {/* Left: Phoenix Sovereign Reality Logo & Mode Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-500/30 text-slate-950">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-amber-400 font-mono">PHOENIX</h1>
              <p className="text-[10px] tracking-widest text-slate-400 font-mono uppercase">Sovereign Reality</p>
            </div>
          </div>

          {/* Tutorial & Mode Buttons */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-amber-500/20"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>INSTRUCTIONS</span>
            </button>

            <button
              onClick={() => setGameMode(prev => prev === 'VS_CPU' ? 'SOLO' : 'VS_CPU')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                gameMode === 'VS_CPU' 
                  ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm shadow-purple-500/20' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {gameMode === 'VS_CPU' ? <Bot className="w-3.5 h-3.5 text-purple-400" /> : <UserCheck className="w-3.5 h-3.5" />}
              <span>{gameMode === 'VS_CPU' ? 'VS CPU AI' : 'SOLO MODE'}</span>
            </button>
          </div>
        </div>

        {/* Center: Turn & Cycle Counter */}
        <div className="flex items-center gap-4 bg-slate-950/80 px-5 py-2 rounded-xl border border-amber-500/40">
          <div className="text-center">
            <span className="text-[11px] font-mono text-slate-400 tracking-widest block">TURN 14: CYCLE {cycle}</span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold">
                <Settings className="w-3.5 h-3.5" />
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-amber-400 font-serif font-black px-1 border border-amber-500/50 rounded">H</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Phoenix 1 Hero Status Bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-950/90 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1 text-amber-400">
              <span className="font-bold">PHOENIX 1</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400 border-l border-slate-800 pl-3">
              <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
              <span>STATUS</span>
              <span className="font-bold text-slate-100">{heroStats.status}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 border-l border-slate-800 pl-3">
              <Heart className="w-3.5 h-3.5 fill-emerald-500/30" />
              <span>VITALITY</span>
              <span className="font-bold text-slate-100">{heroStats.vitality}</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 border-l border-slate-800 pl-3">
              <Zap className="w-3.5 h-3.5" />
              <span>RESOURCE</span>
              <span className="font-bold text-slate-100">{heroStats.resource}</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-400 border-l border-slate-800 pl-3">
              <Anchor className="w-3.5 h-3.5" />
              <span className="font-bold text-slate-100">{heroStats.anchor}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== MAIN WORKSPACE (LEFT HUD + CENTER 3D OMNI-BOARD) ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* ==================== LEFT COLUMN (HERO ATTRIBUTES HUD & CRYPTEX) ==================== */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* HERO ATTRIBUTES HUD PANEL */}
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-amber-500/30 shadow-lg flex flex-col gap-3">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">HERO ATTRIBUTES</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">HUD</span>
            </div>

            <div className="text-sm font-bold text-slate-100 font-mono tracking-wider">
              {heroStats.name}
            </div>

            {/* Numeric Bars: Vitality, Kinetic, Arcane, Level */}
            <div className="flex flex-col gap-2 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1 text-amber-300">
                  <span>VITALITY</span>
                  <span className="font-bold">{heroStats.vitality}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-amber-500/30">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${heroStats.vitality}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 text-cyan-300">
                  <span>KINETIC</span>
                  <span className="font-bold">72</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-cyan-500/30">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 text-purple-300">
                  <span>ARCANE</span>
                  <span className="font-bold">95</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-purple-500/30">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 text-sky-300">
                  <span>LEVEL</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-sky-500/30">
                  <div className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>

            {/* Abilities Section */}
            <div className="mt-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase block mb-2">ABILITIES</span>
              
              <div className="grid grid-cols-6 gap-1 mb-2">
                {HEX_ABILITIES.map((ab) => {
                  const Icon = ab.icon;
                  const isActive = activeAbility === ab.id;
                  return (
                    <button
                      key={ab.id}
                      onClick={() => {
                        if (soundEnabled) soundFx.playClick();
                        setActiveAbility(ab.id);
                      }}
                      className={`p-1.5 rounded-lg border flex items-center justify-center transition-all ${ab.color} ${isActive ? 'ring-2 ring-amber-400 scale-105' : 'hover:scale-105'}`}
                      title={ab.name}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-5 gap-1">
                {SQUARE_ABILITIES.map((sq) => {
                  const Icon = sq.icon;
                  return (
                    <button
                      key={sq.id}
                      onClick={() => {
                        if (soundEnabled) soundFx.playClick();
                      }}
                      className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 flex items-center justify-center transition-all"
                      title={sq.name}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Hero Portrait Card */}
            <div className="mt-2 p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-lg font-black text-slate-950 shadow-md">
                🔥
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-mono font-bold text-amber-300 truncate">PHOENIX RISING</div>
                <div className="text-[9px] font-mono text-slate-500 truncate">TDOVROENIS RISING</div>
              </div>
            </div>
          </div>

          {/* CRYPTEX HARDWARE BOX PREVIEW */}
          <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-amber-500/30 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">CRYPTEX HARDWARE</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">PREVIEW</span>
            </div>

            <div className="h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative">
              <CryptexBox soundEnabled={soundEnabled} compact={true} />
            </div>

            <div className="flex items-center justify-between text-xs font-mono px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">STATUS: <strong className="text-emerald-400">ACTIVE</strong></span>
              <span className="text-slate-400">CYCLES: <strong className="text-slate-200">142</strong></span>
            </div>
          </div>
        </div>

        {/* ==================== CENTER COLUMN (3D OMNI-BOARD ARENA + PHASE BAR) ==================== */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          
          <OmniBoard3D 
            selectedCard={selectedCard}
            onTileSelect={handleTileSelect}
            activePhase={activePhase}
            heroStats={heroStats}
            units={units}
            floatingFx={floatingFx}
            isCpuTurn={isCpuTurn}
          />

          {/* Action Log Status Bar */}
          <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-400">
              <span className={`w-2 h-2 rounded-full ${isCpuTurn ? 'bg-purple-400' : 'bg-cyan-400'} animate-ping`}></span>
              <span className="font-bold truncate">{actionLog}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              SAVED: LOCALSTORAGE • CHITRAGUPTA AI ONLINE
            </div>
          </div>

          {/* Phase Control Buttons Bar */}
          <div className="flex items-center justify-center gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-xl">
            
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playClick();
                setActivePhase('DEPLOY');
                setActionLog('PHASE CHANGED TO: DEPLOY UNITS');
              }}
              className={`px-6 py-2 rounded-xl font-mono text-xs font-bold tracking-widest transition-all ${
                activePhase === 'DEPLOY' 
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              DEPLOY
            </button>

            <button
              onClick={() => {
                if (soundEnabled) soundFx.playClick();
                setActivePhase('ACTIONS');
                setActionLog('PHASE CHANGED TO: EXECUTE ACTIONS');
              }}
              className={`px-6 py-2 rounded-xl font-mono text-xs font-bold tracking-widest transition-all ${
                activePhase === 'ACTIONS' 
                  ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/40 ring-2 ring-cyan-300' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ACTIONS
            </button>

            <button
              onClick={() => {
                if (soundEnabled) soundFx.playClick();
                setActivePhase('PHASE');
                setActionLog('PHASE CHANGED TO: RESOLVE FIELD PHASES');
              }}
              className={`px-6 py-2 rounded-xl font-mono text-xs font-bold tracking-widest transition-all ${
                activePhase === 'PHASE' 
                  ? 'bg-purple-500 text-slate-950 shadow-lg shadow-purple-500/30' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              PHASE
            </button>

            {gameMode === 'VS_CPU' && (
              <button
                onClick={triggerCpuTurn}
                disabled={isCpuTurn}
                className="px-5 py-2 rounded-xl font-mono text-xs font-bold tracking-widest bg-purple-600 hover:bg-purple-500 text-slate-100 shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
              >
                <Bot className="w-3.5 h-3.5" /> CPU TURN
              </button>
            )}

            <button
              onClick={handleEndTurn}
              className="px-6 py-2 rounded-xl font-mono text-xs font-bold tracking-widest bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/30 transition-all active:scale-95"
            >
              END TURN
            </button>
          </div>
        </div>
      </div>

      {/* ==================== BOTTOM DOCK: HOLOGRAPHIC 7-FORCE CARD HAND ==================== */}
      <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-amber-500/40 shadow-2xl flex flex-col gap-3">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              HOLOGRAPHIC 7-FORCE CARD HAND
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              ; CARDS: PHANTA, AETHER, ECHO, GRAVITY, QUANTUM
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">
            {selectedCard ? `ACTIVE: [${selectedCard.name}]` : 'SELECT CARD TO CAST'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {HOLOGRAPHIC_CARDS.map((card) => {
            const isSelected = selectedCard?.id === card.id;

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`p-3 rounded-xl border flex flex-col justify-between h-44 cursor-pointer transition-all duration-300 relative group overflow-hidden ${card.color} ${
                  isSelected 
                    ? 'ring-2 ring-amber-400 scale-105 shadow-xl -translate-y-2' 
                    : 'hover:scale-102 hover:-translate-y-1'
                }`}
              >
                <div className="flex items-center justify-between border-b border-current/20 pb-1.5">
                  <span className="text-xs font-mono font-black tracking-wider">{card.name}</span>
                  <span className="text-base">{card.icon}</span>
                </div>

                <div className="my-auto text-center py-2">
                  <div className="w-10 h-10 mx-auto rounded-full border border-current/30 flex items-center justify-center text-xl bg-slate-950/40 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                </div>

                <p className="text-[9px] leading-tight font-sans text-slate-300/80 my-1 line-clamp-3">
                  {card.desc}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-current/20">
                  <span className="font-bold">{card.costEnergy} ⚡</span>
                  <span className="font-bold">{card.costWater} 💧</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
