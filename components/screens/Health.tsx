"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Syringe,
  CheckCircle,
  AlertCircle,
  Clock,
  Pill,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CalendarPlus,
  Trash2,
} from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import { useTelegramContext } from "@/components/TelegramProvider";
import { googleCalendarUrl } from "@/lib/calendar";

const PET_ID = "003ab934-9f93-4f2b-aade-10a6fbc8ca40";

interface WeightRecord {
  id: string;
  weight_kg: number;
  recorded_at: string;
}

interface VetEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
}

// Demo vaccine data (will be DB-driven later)
const VACCINES = [
  { name: "Бешенство", date: "2025-03-15", status: "done" as const, nextDue: "2026-03-15" },
  { name: "DHPP (комплекс)", date: "2025-03-15", status: "done" as const, nextDue: "2026-03-15" },
  { name: "Титры антител", date: null, status: "urgent" as const, nextDue: "2025-02-20" },
  { name: "Обработка от клещей", date: "2025-01-10", status: "upcoming" as const, nextDue: "2025-02-10" },
];

// Demo active case
const ACTIVE_CASE = {
  title: "Отит (левое ухо)",
  startDate: "2025-01-28",
  steps: [
    { label: "Осмотр", done: true },
    { label: "Капли 7 дней", done: true },
    { label: "Контрольный визит", done: false },
  ],
  meds: [
    { name: "Суролан", dosage: "3 капли 2р/день", daysLeft: 2 },
  ],
};

export const Health = () => {
  const t = useTranslations("health");
  const { haptic } = useTelegramContext();

  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [loadingWeights, setLoadingWeights] = useState(true);
  const [vetEvents, setVetEvents] = useState<VetEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showAllVaccines, setShowAllVaccines] = useState(false);

  const fetchWeights = useCallback(async () => {
    setLoadingWeights(true);
    try {
      const res = await fetch(`/api/weight?pet_id=${PET_ID}`);
      if (res.ok) {
        const data = await res.json();
        setWeights(data);
      }
    } catch {
      // silent
    } finally {
      setLoadingWeights(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch(`/api/events?pet_id=${PET_ID}`);
      if (res.ok) {
        const data: VetEvent[] = await res.json();
        setVetEvents(data.filter(e => e.type === "vet"));
      }
    } catch {
      // silent
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchWeights();
    fetchEvents();
  }, [fetchWeights, fetchEvents]);

  const latestWeight = weights[0];
  const prevWeight = weights[1];
  const weightDiff = latestWeight && prevWeight
    ? (latestWeight.weight_kg - prevWeight.weight_kg).toFixed(1)
    : null;
  const weightTrend = weightDiff
    ? parseFloat(weightDiff) > 0 ? "up" : parseFloat(weightDiff) < 0 ? "down" : "stable"
    : null;

  const visibleVaccines = showAllVaccines ? VACCINES : VACCINES.slice(0, 3);

  return (
    <div className="space-y-5 animate-fadeIn pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      </div>

      {/* Active Case */}
      <SectionHeader title={t("activeCase")} />
      <Card className="border-l-4 border-l-rose-500">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-white font-medium">{ACTIVE_CASE.title}</h3>
            <p className="text-neutral-500 text-xs mt-0.5">
              {t("since")} {new Date(ACTIVE_CASE.startDate).toLocaleDateString("ru-RU")}
            </p>
          </div>
          <Pill className="w-5 h-5 text-rose-400" />
        </div>

        {/* Treatment steps */}
        <div className="space-y-2 mb-4">
          {ACTIVE_CASE.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              {step.done ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-neutral-600 shrink-0" />
              )}
              <span className={`text-sm ${step.done ? "text-neutral-500 line-through" : "text-white"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Current meds */}
        {ACTIVE_CASE.meds.map((med, i) => (
          <div key={i} className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex justify-between items-center">
            <div>
              <p className="text-white text-sm font-medium">{med.name}</p>
              <p className="text-neutral-400 text-xs">{med.dosage}</p>
            </div>
            <div className="text-right">
              <p className="text-rose-400 text-xs font-medium">
                {t("daysLeft", { days: med.daysLeft })}
              </p>
            </div>
          </div>
        ))}
      </Card>

      {/* Weight Tracker */}
      <SectionHeader
        title={t("weightTitle")}
        action={
          <button
            onClick={() => { haptic.impact("light"); fetchWeights(); }}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingWeights ? "animate-spin" : ""}`} />
          </button>
        }
      />
      <Card>
        {loadingWeights ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 text-neutral-600 animate-spin" />
          </div>
        ) : latestWeight ? (
          <>
            <div className="flex items-end gap-3 mb-4">
              <div>
                <p className="text-neutral-500 text-xs mb-1">{t("currentWeight")}</p>
                <p className="text-4xl font-bold text-white">
                  {latestWeight.weight_kg}
                  <span className="text-lg text-neutral-500 ml-1">{t("kg")}</span>
                </p>
              </div>
              {weightDiff && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium mb-1 ${
                  weightTrend === "up" ? "bg-amber-500/10 text-amber-400" :
                  weightTrend === "down" ? "bg-blue-500/10 text-blue-400" :
                  "bg-neutral-800 text-neutral-400"
                }`}>
                  {weightTrend === "up" && <TrendingUp className="w-3 h-3" />}
                  {weightTrend === "down" && <TrendingDown className="w-3 h-3" />}
                  {weightTrend === "stable" && <Minus className="w-3 h-3" />}
                  {parseFloat(weightDiff) > 0 ? "+" : ""}{weightDiff} {t("kg")}
                </div>
              )}
            </div>

            {/* Weight history mini-chart (last 5) */}
            <div className="flex items-end gap-1 h-16 mb-3">
              {weights.slice(0, 7).reverse().map((w, i) => {
                const min = Math.min(...weights.slice(0, 7).map(r => r.weight_kg));
                const max = Math.max(...weights.slice(0, 7).map(r => r.weight_kg));
                const range = max - min || 1;
                const height = ((w.weight_kg - min) / range) * 100;
                const isLatest = i === weights.slice(0, 7).length - 1;
                return (
                  <div key={w.id} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        isLatest ? "bg-emerald-500" : "bg-neutral-700"
                      }`}
                      style={{ height: `${Math.max(height, 15)}%` }}
                    />
                    <span className="text-[8px] text-neutral-600">
                      {new Date(w.recorded_at).toLocaleDateString("ru-RU", { day: "numeric", month: "numeric" })}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-neutral-600 text-[10px] text-center">
              {t("weightRecords", { count: weights.length })}
            </p>
          </>
        ) : (
          <div className="text-center py-6">
            <Scale className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
            <p className="text-neutral-500 text-sm">{t("noWeightData")}</p>
            <p className="text-neutral-600 text-xs mt-1">{t("addWeightHint")}</p>
          </div>
        )}
      </Card>

      {/* Vaccine Log */}
      <SectionHeader title={t("vaccinesTitle")} />
      <div className="space-y-2">
        {visibleVaccines.map((vax, i) => (
          <Card key={i} className={`flex items-center gap-3 ${
            vax.status === "urgent" ? "border-l-4 border-l-red-500 bg-red-500/5" : ""
          }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              vax.status === "done" ? "bg-emerald-500/10" :
              vax.status === "urgent" ? "bg-red-500/10" :
              "bg-amber-500/10"
            }`}>
              {vax.status === "done" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              {vax.status === "urgent" && <AlertCircle className="w-4 h-4 text-red-500" />}
              {vax.status === "upcoming" && <Clock className="w-4 h-4 text-amber-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{vax.name}</p>
              <p className={`text-xs ${
                vax.status === "done" ? "text-emerald-400" :
                vax.status === "urgent" ? "text-red-400" :
                "text-amber-400"
              }`}>
                {vax.status === "done" && vax.date
                  ? `${t("vaccDone")} ${new Date(vax.date).toLocaleDateString("ru-RU")}`
                  : vax.status === "urgent"
                  ? `${t("vaccUrgent")} ${new Date(vax.nextDue).toLocaleDateString("ru-RU")}`
                  : `${t("vaccNext")} ${new Date(vax.nextDue).toLocaleDateString("ru-RU")}`
                }
              </p>
            </div>
            {vax.status === "done" && (
              <Syringe className="w-4 h-4 text-neutral-700 shrink-0" />
            )}
          </Card>
        ))}
      </div>

      {VACCINES.length > 3 && (
        <button
          onClick={() => {
            haptic.selection();
            setShowAllVaccines(!showAllVaccines);
          }}
          className="w-full text-center text-neutral-500 text-xs py-2 flex items-center justify-center gap-1 hover:text-white transition-colors"
        >
          {showAllVaccines ? (
            <><ChevronUp className="w-3 h-3" /> {t("showLess")}</>
          ) : (
            <><ChevronDown className="w-3 h-3" /> {t("showAll", { count: VACCINES.length })}</>
          )}
        </button>
      )}

      {/* Vet Visits from DB */}
      <SectionHeader
        title={t("upcomingVisits")}
        action={
          <button
            onClick={() => { haptic.impact("light"); fetchEvents(); }}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingEvents ? "animate-spin" : ""}`} />
          </button>
        }
      />
      {loadingEvents ? (
        <Card className="flex items-center justify-center py-6">
          <RefreshCw className="w-5 h-5 text-neutral-600 animate-spin" />
        </Card>
      ) : vetEvents.length > 0 ? (
        <div className="space-y-2">
          {vetEvents.map(event => (
            <Card key={event.id} className="border-l-4 border-l-rose-500 group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm">{event.title}</h3>
                  <p className="text-rose-400 text-xs mt-0.5">
                    {new Date(event.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                    {event.time && ` в ${event.time}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={googleCalendarUrl({ title: `🏥 ${event.title}`, date: event.date, time: event.time, location: event.location, description: "GoBoop — визит к ветеринару" })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-neutral-600 hover:text-blue-400 transition-colors"
                    title="Добавить в Google Calendar"
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </a>
                  <button
                    onClick={async () => {
                      if (!confirm("Удалить?")) return;
                      await fetch("/api/events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: event.id }) });
                      fetchEvents();
                    }}
                    className="p-1.5 text-neutral-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {event.location && (
                <div className="bg-neutral-900/50 p-2 rounded-lg border border-neutral-800 mt-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-neutral-500" />
                    <span className="text-neutral-300 text-xs">{event.location}</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-6">
          <MapPin className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
          <p className="text-neutral-500 text-sm">{t("noVisits")}</p>
          <p className="text-neutral-600 text-xs mt-1">{t("addVisitHint")}</p>
        </Card>
      )}
    </div>
  );
};
