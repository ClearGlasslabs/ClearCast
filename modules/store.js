// Central state store with pub/sub pattern.
// All mutable app state lives here; never mutate directly—use setState().

const _listeners = new Set();
let _state = {};

export const store = {
  /** Initialize with a full state snapshot (called on boot). */
  init(initialState) {
    _state = { ...initialState };
  },

  /** Read current state (immutable snapshot). */
  getState() {
    return _state;
  },

  /** Merge partial update and notify all subscribers. */
  setState(partial) {
    _state = { ..._state, ...partial };
    this.notify();
  },

  /** Subscribe to all state changes. Returns an unsubscribe function. */
  subscribe(listener) {
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  },

  notify() {
    _listeners.forEach(fn => fn(_state));
  },
};
