// Persistence layer — thin localStorage wrapper.
// All persisted keys live under one namespaced JSON blob.

const STORAGE_KEY = 'nexus_omega_v11';

export function saveState(state) {
  try {
    const payload = {
      deals: state.deals,
      contracts: state.contracts,
      tasks: state.tasks,
      envData: state.envData,
      activityLog: state.activityLog.slice(-200), // cap log size
      settings: state.settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('[Persistence] Save failed:', e);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[Persistence] Load failed — clearing corrupt state:', e);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
