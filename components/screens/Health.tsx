"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui";

export const Health = () => {
  const t = useTranslations("health");

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      </div>
      <Card className="border-l-4 border-l-rose-500 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-white font-medium text-lg">{t("vetVisit")}</h2>
            <p className="text-rose-400 text-sm">{t("vetTomorrow")}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-500 block">{t("remaining")}</span>
            <span className="text-white font-mono">19ч</span>
          </div>
        </div>
        <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3 h-3 text-neutral-500" />
            <span className="text-neutral-300 text-xs">
              {t("clinic")}
            </span>
          </div>
          <p className="text-neutral-400 text-xs pl-5">
            {t("doctor")}
          </p>
        </div>
      </Card>
    </div>
  );
};
