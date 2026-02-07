"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";

export const Travel = () => {
  const t = useTranslations("travel");

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {t("title")}
        </h1>
        <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
          {t("daysLeft", { days: 24 })}
        </div>
      </div>
      <SectionHeader title={t("urgentSection")} />
      <Card className="border-l-4 border-l-red-500 bg-red-500/5">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white text-sm font-medium">
              {t("urgentTiters")}
            </h3>
            <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
              {t("urgentTitersDesc")}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
