import React, { useState } from 'react';
import OmniBoard3D from './OmniBoard3D';
import CryptexBox from './HardwareSimulators/CryptexBox';
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
  VolumeX
} from 'lucide-react';

export default function FlagshipArena({ soundEnabled, onObjectiveComplete }) {
  // Game Cycle State matching reference UI (Turn 14: Cycle 3)
  const [turn, setTurn] = useState(14);
  const [cycle, setCycle] = useState(3);
  const [activePhase, setActivePhase] = useState('ACTIONS'); // DEPLOY, ACTIONS, PHASE, END_TURN

  // Hero Stats State matching reference UI
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

  // Selected Card from Holographic 7-Force Card Hand
  const [selectedCard, setSelectedCard] = useState(null);
  const [activeAbility, setActiveAbility] = useState(null);
  const [actionLog, setActionLog] = useState('TURN 14 STARTED: ACTIONS PHASE ACTIVE');

  // Holographic 7-Force Card Hand Data (Matching exact screenshot cards)
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

  // Abilities List (Row 1 Hexagons & Row 2 Squares)
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

  // Handle Card Play Execution
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

  // Handle Tile Selection on 3D Omni-Board
  const handleTileSelect = (tile) => {
    if (selectedCard) {
      if (soundEnabled) soundFx.playCompileSuccess();

      setActionLog(`EXECUTED [${selectedCard.name}] ON TILE (${tile.x}, ${tile.y}). CONSUMED ${selectedCard.costEnergy}⚡`);
      
      // Update Hero Resources
      setHeroStats(prev => ({
        ...prev,
        resource: Math.max(0, prev.resource - 5),
        vitality: Math.min(100, prev.vitality + 2)
      }));

      setSelectedCard(null);

      if (onObjectiveComplete) onObjectiveComplete('obj-paninian-lifo-combo');
    }
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

    setActionLog(`TURN ${turn} CYCLE ${cycle}: TURN ENDED. RECHARGED +15 RESOURCE.`);
    setHeroStats(prev => ({ ...prev, resource: Math.min(100, prev.resource + 15) }));
  };

  return (
    <div className="flex flex-col gap-4 text-slate-100 font-sans pb-10">
      
      {/* ==================== TOP SYSTEM HEADER HUD ==================== */}
      <header className="flex flex-wrap items-center justify-between bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-amber-500/30 shadow-xl shadow-amber-950/20">
        
        {/* Left: Phoenix Sovereign Reality Logo & Sub-Nav */}
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

          {/* Hex Sub-Nav Icons */}
          <div className="hidden sm:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-800">
            {['hex1', 'hex2', 'hex3', 'hex4', 'hex5'].map((h, i) => (
              <button key={h} className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/50 flex items-center justify-center text-xs text-slate-400 hover:text-amber-300 transition-all">
                ❖
              </button>
            ))}
          </div>
        </div>

        {/* Center: Turn & Cycle Counter with Hex Status Nodes */}
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
              
              {/* Vitality (88) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1 text-amber-300">
                  <span>VITALITY</span>
                  <span className="font-bold">88</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-amber-500/30">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>

              {/* Kinetic (72) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1 text-cyan-300">
                  <span>KINETIC</span>
                  <span className="font-bold">72</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-cyan-500/30">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>

              {/* Arcane (95) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1 text-purple-300">
                  <span>ARCANE</span>
                  <span className="font-bold">95</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-purple-500/30">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              {/* Level (12) */}
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
              
              {/* Row 1: 6 Hexagonal Ability Buttons */}
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

              {/* Row 2: 5 Square Ability Icons */}
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

            {/* Embedded 3D Sci-Fi Box Preview */}
            <div className="h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative">
              <CryptexBox soundEnabled={soundEnabled} compact={true} />
            </div>

            {/* Status & Cycles Readouts */}
            <div className="flex items-center justify-between text-xs font-mono px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">STATUS: <strong className="text-emerald-400">ACTIVE</strong></span>
              <span className="text-slate-400">CYCLES: <strong className="text-slate-200">142</strong></span>
            </div>
          </div>
        </div>

        {/* ==================== CENTER COLUMN (3D OMNI-BOARD ARENA + PHASE BAR) ==================== */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          
          {/* Interactive 3D Omni-Board Canvas */}
          <OmniBoard3D 
            selectedCard={selectedCard}
            onTileSelect={handleTileSelect}
            activePhase={activePhase}
            heroStats={heroStats}
            onHeroStatsChange={setHeroStats}
          />

          {/* Action Log Status Bar */}
          <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-bold truncate">{actionLog}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              COMMAND BUFFER: SYNCHRONIZED
            </div>
          </div>

          {/* Phase Control Buttons Bar */}
          <div className="flex items-center justify-center gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-xl">
            
            {/* Deploy Pill */}
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

            {/* Actions Pill (Active State) */}
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

            {/* Phase Pill */}
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

            {/* End Turn Pill (Gold Accent) */}
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
        
        {/* Header Title */}
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

        {/* 7 Glowing Holographic Cards Deck */}
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
                {/* Top Card Name & Icon */}
                <div className="flex items-center justify-between border-b border-current/20 pb-1.5">
                  <span className="text-xs font-mono font-black tracking-wider">{card.name}</span>
                  <span className="text-base">{card.icon}</span>
                </div>

                {/* Card Emblem / Graphic Motif */}
                <div className="my-auto text-center py-2">
                  <div className="w-10 h-10 mx-auto rounded-full border border-current/30 flex items-center justify-center text-xl bg-slate-950/40 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                </div>

                {/* Card Description */}
                <p className="text-[9px] leading-tight font-sans text-slate-300/80 my-1 line-clamp-3">
                  {card.desc}
                </p>

                {/* Card Costs (Energy ⚡ / Water 💧) */}
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
