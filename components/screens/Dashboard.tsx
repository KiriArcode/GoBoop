"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Heart,
  Activity,
  Plane,
  MapPin,
  CheckCircle,
  Clock,
  ChevronRight,
  Trophy,
  Zap,
  Calendar,
} from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";

const PET_ID = "003ab934-9f93-4f2b-aade-10a6fbc8ca40";

interface EventItem {
  id: string;
  type: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
}

interface DashboardProps {
  happiness: number;
  timeSinceWalk: string;
  onWalkDone: (e: React.MouseEvent) => void;
  navigateTo: (tab: string) => void;
  userName?: string | null;
}

export const Dashboard = ({
  happiness,
  timeSinceWalk,
  onWalkDone,
  navigateTo,
  userName,
}: DashboardProps) => {
  const t = useTranslations("dashboard");
  const [events, setEvents] = useState<EventItem[]>([]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/events?pet_id=${PET_ID}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const upcomingVet = events.find(e => e.type === "vet");
  const upcomingTrip = events.find(e => e.type === "trip");

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      {/* Header — Pet name + Happiness */}
      <div className="relative pt-2 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            {userName && (
              <p className="text-neutral-500 text-xs mb-1">
                {t("greeting", { name: userName })}
              </p>
            )}
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Арчи
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-neutral-400 text-sm">{t("petStatus")}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 bg-neutral-800/50 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
              <Heart
                className={`w-4 h-4 ${happiness > 80 ? "text-rose-500 fill-rose-500" : "text-amber-500"}`}
              />
              <span className="text-white font-medium">{happiness}%</span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1">
              {t("happinessIndex")}
            </span>
          </div>
        </div>
      </div>

      {/* Walk Card */}
      <Card className="border-l-4 border-l-lime-500">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-lime-500/10 rounded-lg">
              <MapPin className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">{t("walks.title")}</h3>
              <p className="text-lime-400 text-xs font-medium">
                {t("walks.goal")}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onWalkDone}
          className="w-full bg-neutral-800 hover:bg-neutral-700 border border-lime-500/30 rounded-xl p-4 flex items-center justify-between transition-all active:scale-[0.98] group mb-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center group-hover:bg-lime-500/30 transition-colors">
              <CheckCircle className="w-5 h-5 text-lime-400" />
            </div>
            <div className="text-left">
              <span className="text-white font-medium block">
                {t("walks.done")}
              </span>
              <span className="text-neutral-500 text-xs">
                {t("walks.tapToMark")}
              </span>
            </div>
          </div>
          <div className="text-right bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="text-xs text-neutral-400 block mb-0.5">
              {t("walks.elapsed")}
            </span>
            <span className="text-lime-400 font-mono font-bold text-sm">
              {timeSinceWalk}
            </span>
          </div>
        </button>

        {/* Walk timeline */}
        <div className="relative flex items-center justify-between mb-4 px-2">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-neutral-800 -z-0"></div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-lime-500 border-2 border-[#1A1A1A] flex items-center justify-center shadow-[0_0_10px_rgba(132,204,22,0.4)]">
              <CheckCircle className="w-3 h-3 text-[#1A1A1A]" />
            </div>
            <div className="text-center">
              <span className="text-[10px] text-neutral-400 block">08:30</span>
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-800 border-2 border-lime-500/50 flex items-center justify-center">
              <Clock className="w-3 h-3 text-lime-400" />
            </div>
            <div className="text-center">
              <span className="text-[10px] text-lime-400 block">{t("walks.now")}</span>
            </div>
          </div>
        </div>

        {/* Walk idea */}
        <div className="bg-neutral-900/50 rounded-xl p-3 border border-dashed border-neutral-700 flex gap-3 items-center">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <p className="text-neutral-300 text-xs font-medium">
              {t("walks.idea")}
            </p>
            <p className="text-neutral-500 text-[10px]">
              {t("walks.ideaText")}
            </p>
          </div>
        </div>
      </Card>

      {/* Events from DB */}
      <SectionHeader title={t("events")} />
      <div className="grid grid-cols-2 gap-3">
        <Card
          onClick={() => navigateTo("health")}
          highlight
          className="hover:border-rose-500/50 group"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-1.5 bg-rose-500/10 rounded-md">
              <Activity className="w-4 h-4 text-rose-500" />
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-rose-500 transition-colors" />
          </div>
          {upcomingVet ? (
            <>
              <p className="text-neutral-400 text-xs mb-0.5">{upcomingVet.title}</p>
              <p className="text-white font-medium text-sm">
                {new Date(upcomingVet.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                {upcomingVet.time && `, ${upcomingVet.time}`}
              </p>
              {upcomingVet.location && (
                <p className="text-rose-400 text-[10px] mt-1">{upcomingVet.location}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-neutral-400 text-xs mb-0.5">{t("vetVisit")}</p>
              <p className="text-neutral-600 text-sm">{t("noEvents")}</p>
            </>
          )}
        </Card>

        <Card
          onClick={() => navigateTo("travel")}
          highlight
          className="hover:border-blue-500/50 group"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-1.5 bg-blue-500/10 rounded-md">
              <Plane className="w-4 h-4 text-blue-500" />
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-blue-500 transition-colors" />
          </div>
          {upcomingTrip ? (
            <>
              <p className="text-neutral-400 text-xs mb-0.5">{upcomingTrip.title}</p>
              <p className="text-white font-medium text-sm">
                {new Date(upcomingTrip.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
              </p>
              <div className="flex items-center gap-1 mt-2 bg-blue-900/30 px-2 py-1 rounded w-fit">
                <Calendar className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] text-blue-200">
                  {Math.max(0, Math.ceil((new Date(upcomingTrip.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} {t("daysShort")}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-neutral-400 text-xs mb-0.5">{t("travelCity")}</p>
              <p className="text-neutral-600 text-sm">{t("noEvents")}</p>
            </>
          )}
        </Card>
      </div>

      {/* Family */}
      <SectionHeader
        title={t("family")}
        action={
          <span
            onClick={() => navigateTo("family")}
            className="text-xs text-neutral-500 cursor-pointer"
          >
            {t("details")}
          </span>
        }
      />
      <Card
        onClick={() => navigateTo("family")}
        className="flex items-center justify-between bg-gradient-to-r from-[#1A1A1A] to-[#252525]"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-neutral-700 border-2 border-amber-500 flex items-center justify-center text-xs font-bold text-white">
              М
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-500 text-[8px] text-black font-bold px-1 rounded-full">
              #1
            </div>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{t("familyLeader")}</p>
            <p className="text-neutral-500 text-xs">
              {t("familyLeaderSub")}
            </p>
          </div>
        </div>
        <Trophy className="w-5 h-5 text-amber-500/50" />
      </Card>
    </div>
  );
};
