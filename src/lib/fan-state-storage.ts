"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FanState } from "@/domain/archive";

const STORAGE_KEY = "haunt-memo:fan-state:v1";
const EMPTY: FanState = { listened: new Set(), favourites: new Set() };

type StoredFanState = { listened: string[]; favourites: string[] };

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedState: FanState = EMPTY;
let memoryOnly = false;

function read(): FanState {
  if (memoryOnly) return cachedState;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cachedState;
  }
  if (raw === cachedRaw) return cachedState;
  cachedRaw = raw;
  cachedState = parse(raw);
  return cachedState;
}

function parse(raw: string | null): FanState {
  if (!raw) return EMPTY;
  try {
    const stored = JSON.parse(raw) as Partial<StoredFanState>;
    return {
      listened: new Set(Array.isArray(stored.listened) ? stored.listened : []),
      favourites: new Set(Array.isArray(stored.favourites) ? stored.favourites : []),
    };
  } catch {
    return EMPTY;
  }
}

function write(state: FanState) {
  const stored: StoredFanState = { listened: [...state.listened], favourites: [...state.favourites] };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Private browsing or full storage: keep the marks for this visit only, ignoring the stale stored copy.
    memoryOnly = true;
    cachedState = state;
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function toggle(set: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/** The Fan's listened and favourite marks, kept in this browser's localStorage. */
export function useFanState() {
  const fanState = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggleListened = useCallback((storyId: string) => {
    const current = read();
    write({ ...current, listened: toggle(current.listened, storyId) });
  }, []);

  const toggleFavourite = useCallback((storyId: string) => {
    const current = read();
    write({ ...current, favourites: toggle(current.favourites, storyId) });
  }, []);

  return { fanState, toggleListened, toggleFavourite };
}
