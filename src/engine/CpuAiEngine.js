// Chitragupta CPU AI Engine - Autonomous Tactical Decision System

export class CpuAiEngine {
  constructor() {
    this.name = 'CHITRAGUPTA AI';
    this.role = 'Tactical Overlord';
    this.cards = [
      { id: 'cpu-phanta', name: 'PHANTA STRIKE', cost: 35, dmg: 35, type: 'OFFENSIVE' },
      { id: 'cpu-aether', name: 'AETHER SHIELD', cost: 28, heal: 25, type: 'DEFENSIVE' },
      { id: 'cpu-dynamo', name: 'DYNAMO CHAIN', cost: 23, dmg: 25, type: 'AREA' },
      { id: 'cpu-gravity', name: 'GRAVITY PULL', cost: 29, dmg: 20, type: 'TACTICAL' },
      { id: 'cpu-quantum', name: 'QUANTUM SHIFT', cost: 26, heal: 30, type: 'UTILITY' }
    ];
  }

  // Execute CPU Turn given current 3D units & player hero state
  executeTurn(units, playerHeroStats, terrainMap) {
    const logs = [];
    let updatedUnits = units.map(u => ({ ...u }));
    let updatedPlayerStats = { ...playerHeroStats };

    // Identify CPU units (Orlis Archon, Void Reaper, Void Titan) & Player unit (Phoenix Rising)
    const playerUnit = updatedUnits.find(u => u.id === 'phoenix');
    const cpuUnits = updatedUnits.filter(u => u.id !== 'phoenix');

    if (!playerUnit) {
      return { units: updatedUnits, playerStats: updatedPlayerStats, logs: ['CPU AI: Player unit not found on board.'] };
    }

    logs.push(`CHITRAGUPTA AI: Scanning 15x15 Omni-Board coordinates (A1-O15)...`);

    // 1. Evaluate each CPU unit and decide action
    cpuUnits.forEach(cpuUnit => {
      const dist = Math.abs(cpuUnit.gx - playerUnit.gx) + Math.abs(cpuUnit.gy - playerUnit.gy);
      
      // Decision Step A: Movement strategy - Move closer if far, or seek cover if low HP
      if (dist > 3) {
        // Move 1-2 steps towards player
        const dx = Math.sign(playerUnit.gx - cpuUnit.gx);
        const dy = Math.sign(playerUnit.gy - cpuUnit.gy);
        const newGx = Math.max(0, Math.min(14, cpuUnit.gx + dx));
        const newGy = Math.max(0, Math.min(14, cpuUnit.gy + dy));

        cpuUnit.gx = newGx;
        cpuUnit.gy = newGy;
        logs.push(`AI [${cpuUnit.name}]: Relocated to (${newGx}, ${newGy}) seeking optimal fire angle.`);
      }

      // Decision Step B: Card & Attack Selection
      const distAfterMove = Math.abs(cpuUnit.gx - playerUnit.gx) + Math.abs(cpuUnit.gy - playerUnit.gy);
      
      if (distAfterMove <= 6) {
        // Randomly select offensive CPU card
        const card = cpuUnit.hp < 40 ? this.cards[1] : this.cards[0];

        if (card.type === 'OFFENSIVE' || card.type === 'AREA') {
          const rawDmg = card.dmg || 30;
          const actualDmg = Math.max(5, rawDmg - Math.floor(updatedPlayerStats.anchor * 0.2));

          updatedPlayerStats.vitality = Math.max(0, updatedPlayerStats.vitality - actualDmg);
          updatedPlayerStats.status = Math.max(0, updatedPlayerStats.status - actualDmg);

          logs.push(`AI [${cpuUnit.name}] cast [${card.name}] on PHOENIX RISING! Dealt -${actualDmg} KINETIC DMG!`);
        } else if (card.type === 'DEFENSIVE') {
          cpuUnit.hp = Math.min(cpuUnit.maxHp, cpuUnit.hp + (card.heal || 20));
          logs.push(`AI [${cpuUnit.name}] cast [${card.name}], restoring +${card.heal} HP.`);
        }
      }
    });

    logs.push(`CHITRAGUPTA AI: Turn compilation complete. Command handed back to Player.`);

    return {
      units: updatedUnits,
      playerStats: updatedPlayerStats,
      logs,
      floatingFx: {
        target: 'phoenix',
        text: '-30 KINETIC DMG!',
        color: '#ef4444'
      }
    };
  }
}
