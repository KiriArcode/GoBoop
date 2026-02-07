"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook that syncs state with localStorage.
 * - Reads from localStorage on mount (falls back to initialValue).
 * - Writes to localStorage on every state change.
 * - Handles SSR (typeof window check).
 * - Supports functional updater like useState.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Lazy initializer: read from localStorage once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      console.warn(`useLocalStorage: error reading key "${key}"`, );
      return initialValue;
    }
  });

  // Persist to localStorage whenever value changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      console.warn(`useLocalStorage: error writing key "${key}"`);
    }
  }, [key, storedValue]);

  // Setter that supports functional updates
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        return nextValue;
      });
    },
    []
  );

  return [storedValue, setValue];
}
