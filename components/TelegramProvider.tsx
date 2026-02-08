"use client";

import React, { createContext, useContext } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import type { TelegramUser, WebApp } from "@/lib/telegram";

interface TelegramContextValue {
  isTMA: boolean;
  webApp: WebApp | null;
  user: TelegramUser | null;
  locale: string | null;
  colorScheme: "light" | "dark";
  haptic: {
    impact: (style?: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notification: (type?: "error" | "success" | "warning") => void;
    selection: () => void;
  };
  safeArea: { top: number; bottom: number; left: number; right: number };
  contentSafeArea: { top: number; bottom: number; left: number; right: number };
}

const TelegramContext = createContext<TelegramContextValue>({
  isTMA: false,
  webApp: null,
  user: null,
  locale: null,
  colorScheme: "dark",
  haptic: {
    impact: () => {},
    notification: () => {},
    selection: () => {},
  },
  safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
  contentSafeArea: { top: 0, bottom: 0, left: 0, right: 0 },
});

export const useTelegramContext = () => useContext(TelegramContext);

export const TelegramProvider = ({ children }: { children: React.ReactNode }) => {
  const telegram = useTelegram();

  return (
    <TelegramContext.Provider value={telegram}>
      {children}
    </TelegramContext.Provider>
  );
};
