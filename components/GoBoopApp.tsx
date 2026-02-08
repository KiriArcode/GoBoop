"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Activity, Plane, Plus, Users, Home } from "lucide-react";
import { NavButton } from "@/components/ui";
import { Dashboard, Health, Travel, Family } from "@/components/screens";
import { QuickAddMenu } from "@/components/widgets/QuickAddMenu";
import { useTelegramContext } from "@/components/TelegramProvider";

// Debug log — only active on localhost
const isDev =
  typeof window !== "undefined" && window.location.hostname === "localhost";
const log = (msg: string, data?: object) => {
  if (!isDev) return;
  console.log(`[GoBoop] ${msg}`, data ?? "");
};

export default function GoBoopApp() {
  const t = useTranslations("nav");
  const { isTMA, haptic, safeArea, contentSafeArea, user } = useTelegramContext();

  useEffect(() => {
    log("GoBoopApp mounted", { isTMA, user: user?.first_name ?? "browser" });
  }, [isTMA, user]);

  const [activeTab, setActiveTab] = useLocalStorage(
    "goboop_activeTab",
    "dashboard"
  );
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickActionType, setQuickActionType] = useState<string | null>(null);
  const [happiness, setHappiness] = useLocalStorage("goboop_happiness", 85);

  // Store lastWalkTime as ISO string for JSON serialization
  const [lastWalkTimeISO, setLastWalkTimeISO] = useLocalStorage(
    "goboop_lastWalkTime",
    new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  );
  const lastWalkTime = useMemo(
    () => new Date(lastWalkTimeISO),
    [lastWalkTimeISO]
  );
  const setLastWalkTime = (date: Date) => setLastWalkTimeISO(date.toISOString());

  const [timeSinceWalk, setTimeSinceWalk] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const diff = Date.now() - lastWalkTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours === 0 && minutes === 0) {
        setTimeSinceWalk("Только что");
      } else {
        setTimeSinceWalk(`${hours}ч ${minutes}м назад`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [lastWalkTime]);

  const handleWalkDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    log("Walk done!", { time: now.toISOString() });
    setLastWalkTime(now);
    setHappiness((prev) => Math.min(100, prev + 5));
  };

  const navigateTo = (tab: string) => {
    log("Navigate to:", { tab });
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!showQuickAdd) {
      setTimeout(() => setQuickActionType(null), 300);
    }
  }, [showQuickAdd]);

  // Compute safe area padding for Telegram
  const topPad = isTMA ? safeArea.top + contentSafeArea.top : 0;
  const bottomPad = isTMA ? safeArea.bottom : 0;

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-200 font-sans selection:bg-rose-500/30">
      <QuickAddMenu
        showQuickAdd={showQuickAdd}
        setShowQuickAdd={setShowQuickAdd}
        quickActionType={quickActionType}
        setQuickActionType={setQuickActionType}
      />

      <div className="max-w-md mx-auto min-h-screen relative flex flex-col">
        <div
          className="flex-1 p-5 overflow-y-auto custom-scrollbar"
          style={{ paddingTop: topPad > 0 ? `${topPad + 20}px` : undefined }}
        >
          {activeTab === "dashboard" && (
            <Dashboard
              happiness={happiness}
              timeSinceWalk={timeSinceWalk}
              onWalkDone={handleWalkDone}
              navigateTo={navigateTo}
              userName={user?.first_name}
            />
          )}
          {activeTab === "health" && <Health />}
          {activeTab === "travel" && <Travel />}
          {activeTab === "family" && <Family />}
        </div>

        {/* Bottom Navigation */}
        <div
          className="fixed bottom-0 left-0 right-0 bg-[#121212]/90 backdrop-blur-xl border-t border-white/5 z-50"
          style={{ paddingBottom: bottomPad > 0 ? `${bottomPad}px` : undefined }}
        >
          <div className="max-w-md mx-auto flex justify-around items-center p-2">
            <NavButton
              icon={Home}
              label={t("home")}
              isActive={activeTab === "dashboard"}
              onClick={() => navigateTo("dashboard")}
            />
            <NavButton
              icon={Activity}
              label={t("health")}
              isActive={activeTab === "health"}
              onClick={() => navigateTo("health")}
            />
            <div className="relative -top-6">
              <button
                onClick={() => {
                  haptic.impact("heavy");
                  setShowQuickAdd(true);
                }}
                className={`w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] transform transition-all duration-300 hover:scale-105 active:scale-95 ${showQuickAdd ? "rotate-45" : ""}`}
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <NavButton
              icon={Plane}
              label={t("travel")}
              isActive={activeTab === "travel"}
              onClick={() => navigateTo("travel")}
            />
            <NavButton
              icon={Users}
              label={t("family")}
              isActive={activeTab === "family"}
              onClick={() => navigateTo("family")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
