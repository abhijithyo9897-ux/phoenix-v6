import React, { useRef, useEffect, useState } from 'react';

export default function OmniBoard3D({ 
  selectedCard, 
  onTileSelect, 
  activePhase = 'ACTIONS',
  heroStats,
  onHeroStatsChange 
}) {
  const canvasRef = useRef(null);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState('phoenix');
  const [selectedTile, setSelectedTile] = useState({ x: 7, y: 7 }); // G8 coordinate
  const [laserPulse, setLaserPulse] = useState(0);

  // 15x15 Grid setup (A1..O15)
  const COLS = ['A1', 'A2', 'A3', 'D4', 'D6', 'G7', 'G8', 'G9', 'O10', 'O12', 'O13', 'O14', 'O15'];
  const ROWS = ['A15', 'O12', 'O8', 'O4', 'O5', 'O6', 'O7', 'O8', 'O9', 'O10', 'O12', 'O13', 'O14', 'O15'];
  const GRID_SIZE = 15;

  // Initial 3D Units on Omni-Board
  const [units, setUnits] = useState([
    { 
      id: 'phoenix', 
      name: 'PHOENIX RISING', 
      gx: 0, 
      gy: 14, // A15
      color: '#f97316', 
      accent: '#fbbf24', 
      hp: heroStats?.vitality || 88, 
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
      gy: 3, // O4/O10
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

  // Terrain elements map (Mountains, Coniferous Forests, Power Relays)
  const terrainMap = useRef({
    '3,2': 'mountain', '3,3': 'mountain', '4,2': 'mountain', '4,3': 'mountain',
    '11,1': 'mountain', '12,1': 'mountain', '12,2': 'mountain', '13,2': 'mountain',
    '2,10': 'forest', '2,11': 'forest', '3,11': 'forest', '3,12': 'forest',
    '11,10': 'forest', '11,11': 'forest', '12,11': 'forest', '12,12': 'forest',
    '9,3': 'pylon', '9,4': 'pylon', '10,3': 'pylon',
    '6,6': 'relay', '8,8': 'relay'
  });

  // Handle laser beam energy animation pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setLaserPulse(prev => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // Main 3D Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas with sleek cosmic ambient background
      ctx.fillStyle = '#070a14';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid noise & star particles in background
      drawCosmicBackground(ctx, width, height);

      // Isometric Transformation Constants
      const originX = width / 2;
      const originY = height * 0.22;
      const tileW = 46; // Tile width
      const tileH = 24; // Tile height

      // Convert Grid (gx, gy) to 3D Isometric Screen (sx, sy)
      const gridToIso = (gx, gy, elevation = 0) => {
        const isoX = originX + (gx - gy) * (tileW / 2);
        const isoY = originY + (gx + gy) * (tileH / 2) - elevation;
        return { x: isoX, y: isoY };
      };

      // 1. Draw Base Board Hexagonal/Isometric Grid Mesh
      for (let gy = 0; gy < GRID_SIZE; gy++) {
        for (let gx = 0; gx < GRID_SIZE; gx++) {
          const pt = gridToIso(gx, gy);
          const isSelected = selectedTile.x === gx && selectedTile.y === gy;
          const isHovered = hoveredTile?.x === gx && hoveredTile?.y === gy;
          const terrainKey = `${gx},${gy}`;
          const terrain = terrainMap.current[terrainKey];

          // Determine Tile Color & Highlight
          let fillColor = '#0f172a80';
          let strokeColor = '#1e293b';
          let lineWidth = 1;

          // Highlight active movement / card target ranges
          const distToPhoenix = Math.abs(gx - units[0].gx) + Math.abs(gy - units[0].gy);
          const inMoveRange = distToPhoenix <= 4;
          const inAttackRange = distToPhoenix > 4 && distToPhoenix <= 8;

          if (selectedCard) {
            if (distToPhoenix <= 6) {
              fillColor = 'rgba(6, 182, 212, 0.15)';
              strokeColor = '#06b6d4';
            }
          } else if (inMoveRange) {
            fillColor = 'rgba(234, 179, 8, 0.08)';
            strokeColor = '#eab30840';
          } else if (inAttackRange) {
            fillColor = 'rgba(168, 85, 247, 0.05)';
            strokeColor = '#a855f730';
          }

          if (isHovered) {
            fillColor = 'rgba(56, 189, 248, 0.35)';
            strokeColor = '#38bdf8';
            lineWidth = 2;
          }

          if (isSelected) {
            fillColor = 'rgba(251, 191, 36, 0.4)';
            strokeColor = '#fbbf24';
            lineWidth = 2.5;
          }

          // Draw Isometric Hex / Diamond Tile
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - tileH / 2);
          ctx.lineTo(pt.x + tileW / 2, pt.y);
          ctx.lineTo(pt.x, pt.y + tileH / 2);
          ctx.lineTo(pt.x - tileW / 2, pt.y);
          ctx.closePath();

          ctx.fillStyle = fillColor;
          ctx.fill();
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
          ctx.restore();

          // Render 3D Terrain Features (Mountains, Trees, Relays)
          if (terrain === 'mountain') {
            draw3DMountain(ctx, pt.x, pt.y, tileW, tileH);
          } else if (terrain === 'forest') {
            draw3DForest(ctx, pt.x, pt.y, tileW, tileH);
          } else if (terrain === 'pylon' || terrain === 'relay') {
            draw3DPylon(ctx, pt.x, pt.y, tileW, tileH, laserPulse);
          }
        }
      }

      // 2. Draw Coordinate Markers (X: A1..O15, Y: A15..O15)
      drawCoordinateLabels(ctx, gridToIso, GRID_SIZE, tileW, tileH);

      // 3. Draw Tactical Laser Beams & Targeting Vectors
      const phoenix = units.find(u => u.id === 'phoenix');
      const orlis = units.find(u => u.id === 'orlis');
      if (phoenix && orlis) {
        const pPt = gridToIso(phoenix.gx, phoenix.gy, 25);
        const oPt = gridToIso(orlis.gx, orlis.gy, 25);

        drawTacticalLaser(ctx, pPt, oPt, laserPulse);
      }

      // 4. Draw 3D Billboarding Units with Holographic Neon Rings & Health Bars
      // Sort units by depth (gy + gx) for proper isometric Z-indexing
      const sortedUnits = [...units].sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));

      sortedUnits.forEach(unit => {
        const isUnitSelected = selectedUnit === unit.id;
        const pt = gridToIso(unit.gx, unit.gy);

        draw3DUnit(ctx, pt.x, pt.y, unit, isUnitSelected, laserPulse);
      });

      // 5. Draw Target Reticle & Damage Tooltip on Hovered / Selected Unit
      if (hoveredTile) {
        const unitOnTile = units.find(u => u.gx === hoveredTile.x && u.gy === hoveredTile.y);
        if (unitOnTile) {
          const pt = gridToIso(unitOnTile.gx, unitOnTile.gy, 40);
          drawUnitTooltip(ctx, pt.x, pt.y, unitOnTile);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [hoveredTile, selectedTile, selectedUnit, units, laserPulse, selectedCard, heroStats]);

  // Handle Canvas Raycasting Mouse Movement
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height * 0.22;
    const tileW = 46;
    const tileH = 24;

    // Inverse Isometric Matrix Transform
    const relX = mx - originX;
    const relY = my - originY;

    const gx = Math.round((relX / (tileW / 2) + relY / (tileH / 2)) / 2);
    const gy = Math.round((relY / (tileH / 2) - relX / (tileW / 2)) / 2);

    if (gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE) {
      setHoveredTile({ x: gx, y: gy });
    } else {
      setHoveredTile(null);
    }
  };

  // Handle Tile Click Selection & Unit Actions
  const handleCanvasClick = () => {
    if (!hoveredTile) return;

    setSelectedTile(hoveredTile);
    const clickedUnit = units.find(u => u.gx === hoveredTile.x && u.gy === hoveredTile.y);

    if (clickedUnit) {
      setSelectedUnit(clickedUnit.id);
    } else {
      // Move selected unit to target tile if in range
      if (selectedUnit === 'phoenix') {
        const dist = Math.abs(hoveredTile.x - units[0].gx) + Math.abs(hoveredTile.y - units[0].gy);
        if (dist <= 5) {
          setUnits(prev => prev.map(u => u.id === 'phoenix' ? { ...u, gx: hoveredTile.x, gy: hoveredTile.y } : u));
          if (onTileSelect) onTileSelect(hoveredTile);
        }
      }
    }
  };

  // Helper Drawing Functions
  const drawCosmicBackground = (ctx, w, h) => {
    // Soft radial ambient light in center
    const grad = ctx.createRadialGradient(w / 2, h * 0.4, 50, w / 2, h * 0.4, w * 0.6);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#090d16');
    grad.addColorStop(1, '#030712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  };

  const draw3DMountain = (ctx, x, y, tileW, tileH) => {
    const h = 28;
    ctx.save();
    // Front face
    ctx.beginPath();
    ctx.moveTo(x, y - tileH / 2 - h);
    ctx.lineTo(x + tileW / 2, y);
    ctx.lineTo(x, y + tileH / 2);
    ctx.closePath();
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Side face
    ctx.beginPath();
    ctx.moveTo(x, y - tileH / 2 - h);
    ctx.lineTo(x - tileW / 2, y);
    ctx.lineTo(x, y + tileH / 2);
    ctx.closePath();
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Glowing cyan peak highlight
    ctx.beginPath();
    ctx.moveTo(x, y - tileH / 2 - h);
    ctx.lineTo(x + 4, y - tileH / 2 - h + 8);
    ctx.lineTo(x - 4, y - tileH / 2 - h + 8);
    ctx.closePath();
    ctx.fillStyle = '#38bdf880';
    ctx.fill();
    ctx.restore();
  };

  const draw3DForest = (ctx, x, y, tileW, tileH) => {
    // 3 Mini Pine Trees
    const trees = [
      { dx: 0, dy: -6, size: 14 },
      { dx: -10, dy: 2, size: 12 },
      { dx: 10, dy: 4, size: 11 }
    ];

    trees.forEach(t => {
      const tx = x + t.dx;
      const ty = y + t.dy;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tx, ty - t.size * 1.5);
      ctx.lineTo(tx + t.size / 2, ty);
      ctx.lineTo(tx - t.size / 2, ty);
      ctx.closePath();
      ctx.fillStyle = '#065f46';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });
  };

  const draw3DPylon = (ctx, x, y, tileW, tileH, pulse) => {
    ctx.save();
    // Tower pillar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 3, y - 30, 6, 30);

    // Glowing Plasma Orb
    const orbGlow = 8 + Math.sin(pulse * 0.1) * 3;
    const grad = ctx.createRadialGradient(x, y - 34, 1, x, y - 34, orbGlow);
    grad.addColorStop(0, '#e879f9');
    grad.addColorStop(0.6, '#c084fc80');
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y - 34, orbGlow, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawTacticalLaser = (ctx, start, end, pulse) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Pulse energy dot moving along line
    const progress = (pulse % 50) / 50;
    const px = start.x + (end.x - start.x) * progress;
    const py = start.y + (end.y - start.y) * progress;

    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#67e8f9';
    ctx.fill();
    ctx.restore();
  };

  const draw3DUnit = (ctx, x, y, unit, isSelected, pulse) => {
    ctx.save();

    // 1. Neon Hexagonal Aura Base Ring
    ctx.beginPath();
    ctx.ellipse(x, y, 22, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = unit.color + '25';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#fbbf24' : unit.color;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.shadowColor = unit.accent;
    ctx.shadowBlur = isSelected ? 15 : 8;
    ctx.stroke();

    // 2. Vertical Energy Column / Unit Billboard Sprite
    const unitH = 36;
    const bodyY = y - unitH;

    // Unit Body Pillar
    const grad = ctx.createLinearGradient(x, bodyY, x, y);
    grad.addColorStop(0, unit.accent);
    grad.addColorStop(1, unit.color);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x - 12, bodyY, 24, 30, 6);
    ctx.fill();

    // Unit Avatar Icon
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(unit.avatar, x, bodyY + 14);

    // 3. Overhead Status HUD Badge (Health Bar + Level Tag)
    const hudY = bodyY - 14;

    // Level Tag
    ctx.fillStyle = '#0f172aee';
    ctx.fillRect(x - 22, hudY - 10, 44, 14);
    ctx.strokeStyle = unit.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 22, hudY - 10, 44, 14);

    ctx.font = '9px monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`LVL ${unit.level}`, x, hudY - 3);

    // Health Bar
    const hpPct = unit.hp / unit.maxHp;
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 20, hudY + 6, 40, 4);
    ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(x - 20, hudY + 6, 40 * hpPct, 4);

    ctx.restore();
  };

  const drawCoordinateLabels = (ctx, gridToIso, size, tileW, tileH) => {
    ctx.save();
    ctx.font = '10px monospace';
    ctx.fillStyle = '#f59e0b90';

    // X axis labels (A1..O15)
    for (let gx = 0; gx < size; gx += 2) {
      const pt = gridToIso(gx, 0);
      ctx.fillText(COLS[gx % COLS.length], pt.x - 10, pt.y - 12);
    }

    // Y axis labels (A15..O15)
    for (let gy = 0; gy < size; gy += 2) {
      const pt = gridToIso(0, gy);
      ctx.fillText(ROWS[gy % ROWS.length], pt.x - 28, pt.y + 4);
    }
    ctx.restore();
  };

  const drawUnitTooltip = (ctx, x, y, unit) => {
    ctx.save();
    ctx.fillStyle = '#090d16f0';
    ctx.strokeStyle = unit.accent;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(x - 60, y - 55, 120, 42, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(unit.name, x, y - 42);

    ctx.font = '9px monospace';
    ctx.fillStyle = unit.accent;
    ctx.fillText(`${unit.role} • HP ${unit.hp}/${unit.maxHp}`, x, y - 28);
    ctx.restore();
  };

  return (
    <div className="relative w-full h-[520px] bg-slate-950 rounded-xl overflow-hidden border border-amber-500/30 shadow-2xl shadow-amber-950/20">
      
      {/* Top Left Omni-Board Header Tag */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-500/40 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span className="text-xs font-mono font-bold tracking-widest text-amber-300">OMNI-BOARD</span>
        <span className="text-[10px] font-mono text-slate-400">| GRID 15x15 (A1-O15)</span>
      </div>

      {/* Top Right Grid Coordinate Readout */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs font-mono">
        <span className="text-slate-400">TARGET:</span>
        <span className="text-cyan-400 font-bold">
          {hoveredTile ? `${COLS[hoveredTile.x % COLS.length]} : ${ROWS[hoveredTile.y % ROWS.length]}` : 'SEARCHING...'}
        </span>
      </div>

      {/* Interactive 3D WebGL / Canvas */}
      <canvas
        ref={canvasRef}
        width={960}
        height={520}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair"
      />

      {/* Bottom Floating Tactical Legend */}
      <div className="absolute bottom-3 left-4 z-10 flex items-center gap-4 text-[11px] font-mono text-slate-400 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-md border border-slate-800">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Phoenix (A15)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cyan-400"></span> Archon (G8)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500"></span> Void Reapers</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Pine Forest (+15 Def)</span>
      </div>
    </div>
  );
}
