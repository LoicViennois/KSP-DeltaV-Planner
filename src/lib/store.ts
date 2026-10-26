import { useSyncExternalStore } from 'react';

export interface Store<T> {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
  /** React hook returning the current value, re-rendering on change. */
  use: () => T;
}

/** A minimal external store for module-level state shared with React. */
export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();

  const get = () => value;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    get,
    subscribe,
    set: (next) => {
      value = next;
      listeners.forEach((listener) => listener());
    },
    use: () => useSyncExternalStore(subscribe, get),
  };
}
