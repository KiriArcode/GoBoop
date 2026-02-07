"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui";

export const Family = () => {
  const t = useTranslations("family");

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      <Card className="bg-gradient-to-b from-neutral-800 to-neutral-900 border-neutral-700">
        <div className="text-center mb-6">
          <h2 className="text-amber-400 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" /> {t("champion")}
          </h2>
        </div>
        <div className="flex justify-center items-end gap-6 mb-8">
          {/* 2nd place — Me */}
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-neutral-700 border-4 border-neutral-800 flex items-center justify-center text-neutral-300 font-bold transition-transform group-hover:scale-110">
              {t("me")}
            </div>
            <div className="h-20 w-14 bg-neutral-800 rounded-t-lg flex items-end justify-center pb-2">
              <span className="text-sm font-bold text-neutral-500">2</span>
            </div>
            <span className="text-neutral-500 text-xs font-mono">240 XP</span>
          </div>

          {/* 1st place — Husband */}
          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="absolute -top-8 animate-bounce text-2xl">&#x1F451;</div>
            <div className="w-20 h-20 rounded-full bg-neutral-700 border-4 border-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              {t("husband")}
            </div>
            <div className="h-32 w-16 bg-gradient-to-t from-amber-600/20 to-amber-500/10 border-x border-t border-amber-500/30 rounded-t-lg flex items-end justify-center pb-4 backdrop-blur-sm">
              <span className="text-2xl font-bold text-amber-500">1</span>
            </div>
            <span className="text-amber-400 text-sm font-bold font-mono">
              450 XP
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
