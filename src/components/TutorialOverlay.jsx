import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldAlert, 
  Cpu, 
  Target, 
  Flame, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';

export default function TutorialOverlay({ isOpen, onClose, onStartPractice }) {
  const [currentStep, setCurrentStep] = useState(0);

  const TUTORIAL_STEPS = [
    {
      title: 'Welcome to Sovereign Reality 3D Arena',
      icon: ShieldAlert,
      color: 'border-amber-500/80 text-amber-400 bg-amber-950/40',
      badge: 'STEP 1 OF 5',
      heading: 'Spatial Grid & 3D Omni-Board Layout',
      content: `Phoenix: Sovereign Reality is a 3D tactical grid strategy game set on a 15x15 coordinate field (A1 to O15). You control Phoenix Rising (Player 1) positioned on tile A15. Use your mouse to hover over tiles to view coordinates, height elevation, and terrain defense bonuses (e.g. Pine Forests provide +15 Defense).`
    },
    {
      title: 'Hero Attributes HUD & Stats',
      icon: Flame,
      color: 'border-rose-500/80 text-rose-400 bg-rose-950/40',
      badge: 'STEP 2 OF 5',
      heading: 'Managing Vitality, Kinetic & Arcane Pools',
      content: `The Left Sidebar HUD displays your active stats: VITALITY (88), KINETIC (72), ARCANE (95), and LEVEL (12). Row 1 features 6 Hexagonal Ability Nodes (Aegis Shield, Pulse Wave, Kinetic Blast, Solar Crest, Slash Vector) with interactive cooldowns. Row 2 contains 5 Square tactical icons.`
    },
    {
      title: 'Holographic 7-Force Card Hand',
      icon: Sparkles,
      color: 'border-cyan-400/80 text-cyan-300 bg-cyan-950/40',
      badge: 'STEP 3 OF 5',
      heading: 'Drafting & Casting Holographic Cards',
      content: `The Bottom Dock contains 7 Holographic Cards: PHANTA (Fire strike), AETHER (Phase shield), DYNAMO (Chain lightning), VALOR (Attack boost), ECHO (Sonic wave), GRAVITY (Vortex pull), and QUANTUM (Superposition). Click a card to select it, then click any grid tile on the 3D Omni-Board to execute the spell.`
    },
    {
      title: 'Chitragupta CPU AI Opponent',
      icon: Cpu,
      color: 'border-purple-500/80 text-purple-300 bg-purple-950/40',
      badge: 'STEP 4 OF 5',
      heading: 'VS CPU AI Battle Protocol',
      content: `You can play against the smart Chitragupta CPU AI. When you end your turn, the AI scans line-of-sight coordinates, relocates enemy units (Orlis Archon, Void Reaper, Void Titan) into cover, drafts cards, fires tactical lasers, and attacks your hero.`
    },
    {
      title: 'Phase Control & Moksha Protocol',
      icon: Target,
      color: 'border-emerald-500/80 text-emerald-400 bg-emerald-950/40',
      badge: 'STEP 5 OF 5',
      heading: 'Turn Progression & Victory Conditions',
      content: `Use the bottom Phase Control Bar to toggle between DEPLOY, ACTIONS, PHASE, and END TURN. Complete objectives to earn global wallet credits (dY'Z CR). Achieve the Moksha Protocol by completing the bridge and executing voluntary point sacrifice!`
    }
  ];

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-2xl p-6 shadow-2xl shadow-amber-950/40 flex flex-col gap-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${step.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold block">
                TACTICAL TUTORIAL & MANUAL • {step.badge}
              </span>
              <h3 className="text-base font-bold font-mono text-slate-100">{step.title}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-amber-300 font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {step.heading}
          </h4>
          <p className="text-xs leading-relaxed text-slate-300 font-sans">
            {step.content}
          </p>
        </div>

        {/* Step Indicator Circles */}
        <div className="flex items-center justify-center gap-2 py-1">
          {TUTORIAL_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentStep ? 'bg-amber-400 w-6' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> PREVIOUS
          </button>

          <button
            onClick={() => {
              if (onStartPractice) onStartPractice();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-amber-300 flex items-center gap-1 transition-all"
          >
            SKIP & PLAY NOW
          </button>

          {currentStep < TUTORIAL_STEPS.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(TUTORIAL_STEPS.length - 1, prev + 1))}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1 transition-all shadow-md shadow-amber-500/20"
            >
              NEXT <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (onStartPractice) onStartPractice();
                onClose();
              }}
              className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1 transition-all shadow-md shadow-emerald-500/20"
            >
              START BATTLE <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
