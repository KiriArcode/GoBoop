"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTelegramWebApp,
  isTelegramWebApp,
  type WebApp,
  type TelegramUser,
} from "@/lib/telegram";

interface UseTelegramReturn {
  /** Whether app is running inside Telegram */
  isTMA: boolean;
  /** Raw WebApp instance */
  webApp: WebApp | null;
  /** Telegram user info */
  user: TelegramUser | null;
  /** User's language code from Telegram (e.g. "ru", "en") */
  locale: string | null;
  /** Color scheme: "dark" or "light" */
  colorScheme: "light" | "dark";
  /** Haptic feedback helpers */
  haptic: {
    impact: (style?: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notification: (type?: "error" | "success" | "warning") => void;
    selection: () => void;
  };
  /** Safe area insets (for notch/dynamic island) */
  safeArea: { top: number; bottom: number; left: number; right: number };
  /** Content safe area (below Telegram header) */
  contentSafeArea: { top: number; bottom: number; left: number; right: number };
}

const ZERO_INSET = { top: 0, bottom: 0, left: 0, right: 0 };

export function useTelegram(): UseTelegramReturn {
  const [webApp, setWebApp] = useState<WebApp | null>(null);
  const [isTMA, setIsTMA] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("dark");
  const [safeArea, setSafeArea] = useState(ZERO_INSET);
  const [contentSafeArea, setContentSafeArea] = useState(ZERO_INSET);

  useEffect(() => {
    const wa = getTelegramWebApp();
    if (!wa) return;

    const inTelegram = isTelegramWebApp();
    setWebApp(wa);
    setIsTMA(inTelegram);

    if (inTelegram) {
      // Tell Telegram the app is ready
      wa.ready();

      // Expand to full height
      wa.expand();

      // Request fullscreen if available (TMA 8.0+)
      if (wa.requestFullscreen) {
        try { wa.requestFullscreen(); } catch { /* not supported */ }
      }

      // Set Telegram header/background to match our dark theme
      wa.setHeaderColor("#121212");
      wa.setBackgroundColor("#121212");

      // Enable closing confirmation to prevent accidental closes
      wa.enableClosingConfirmation();

      // Read user data
      setUser(wa.initDataUnsafe.user ?? null);
      setColorScheme(wa.colorScheme);

      // Read safe area insets
      if (wa.safeAreaInset) setSafeArea(wa.safeAreaInset);
      if (wa.contentSafeAreaInset) setContentSafeArea(wa.contentSafeAreaInset);

      // Listen for theme changes
      const handleThemeChanged = () => {
        setColorScheme(wa.colorScheme);
      };
      wa.onEvent("themeChanged", handleThemeChanged);

      // Listen for safe area changes
      const handleSafeArea = () => {
        if (wa.safeAreaInset) setSafeArea({ ...wa.safeAreaInset });
        if (wa.contentSafeAreaInset) setContentSafeArea({ ...wa.contentSafeAreaInset });
      };
      wa.onEvent("safeAreaChanged", handleSafeArea);
      wa.onEvent("contentSafeAreaChanged", handleSafeArea);

      return () => {
        wa.offEvent("themeChanged", handleThemeChanged);
        wa.offEvent("safeAreaChanged", handleSafeArea);
        wa.offEvent("contentSafeAreaChanged", handleSafeArea);
      };
    }
  }, []);

  // Haptic feedback helpers (safe to call outside Telegram — they just do nothing)
  const impact = useCallback(
    (style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium") => {
      webApp?.HapticFeedback?.impactOccurred(style);
    },
    [webApp]
  );

  const notification = useCallback(
    (type: "error" | "success" | "warning" = "success") => {
      webApp?.HapticFeedback?.notificationOccurred(type);
    },
    [webApp]
  );

  const selection = useCallback(() => {
    webApp?.HapticFeedback?.selectionChanged();
  }, [webApp]);

  return {
    isTMA,
    webApp,
    user,
    locale: user?.language_code ?? null,
    colorScheme,
    haptic: { impact, notification, selection },
    safeArea,
    contentSafeArea,
  };
}
