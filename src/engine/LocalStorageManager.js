// LocalStorageManager - 100% Local Browser Persistence Layer

const STORAGE_KEYS = {
  GAME_STATE: 'PHOENIX_GAME_STATE_V5',
  WALLET_CREDITS: 'PHOENIX_WALLET_CREDITS_V5',
  OBJECTIVES: 'PHOENIX_COMPLETED_OBJECTIVES_V5',
  AUDIO_SETTINGS: 'PHOENIX_AUDIO_SETTINGS_V5'
};

export class LocalStorageManager {
  // Save full interactive game state
  static saveGameState(state) {
    try {
      const payload = JSON.stringify({
        turn: state.turn,
        cycle: state.cycle,
        activePhase: state.activePhase,
        heroStats: state.heroStats,
        units: state.units,
        actionLog: state.actionLog,
        gameMode: state.gameMode,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, payload);
      return true;
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
      return false;
    }
  }

  // Load saved game state
  static loadGameState() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
      return null;
    }
  }

  // Save wallet credits
  static saveWalletCredits(credits) {
    try {
      localStorage.setItem(STORAGE_KEYS.WALLET_CREDITS, credits.toString());
    } catch (e) {
      console.warn('LocalStorage credits save failed:', e);
    }
  }

  // Load wallet credits
  static loadWalletCredits(defaultCredits = 1250) {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.WALLET_CREDITS);
      return val !== null ? parseInt(val, 10) : defaultCredits;
    } catch (e) {
      return defaultCredits;
    }
  }

  // Save completed objective IDs
  static saveCompletedObjectives(objIds) {
    try {
      localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(objIds));
    } catch (e) {
      console.warn('LocalStorage objectives save failed:', e);
    }
  }

  // Load completed objective IDs
  static loadCompletedObjectives(defaultIds = ['obj-card-matrix-snap']) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OBJECTIVES);
      return data ? JSON.parse(data) : defaultIds;
    } catch (e) {
      return defaultIds;
    }
  }

  // Clear saved game match
  static clearGameState() {
    try {
      localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    } catch (e) {
      console.warn('LocalStorage clear failed:', e);
    }
  }
}
