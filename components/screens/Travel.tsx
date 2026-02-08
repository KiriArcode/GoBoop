"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Plane,
  MapPin,
  ChevronRight,
  Calendar,
  RefreshCw,
  PlusCircle,
  CalendarPlus,
  Trash2,
  Plus,
} from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import { useTelegramContext } from "@/components/TelegramProvider";
import { googleCalendarUrl } from "@/lib/calendar";
import type { TripDocument } from "@/lib/types";

const PET_ID = "003ab934-9f93-4f2b-aade-10a6fbc8ca40";

interface TripEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  country_code?: string;
}

const FALLBACK_TRIP = { title: "Тбилиси → Берлин", date: "2025-03-05" };

const INITIAL_DOCS: Array<{ id: string; name: string; status: TripDocument["status"]; note?: string; deadline?: string }> = [
  { id: "chip", name: "Микрочип (ISO 11784)", status: "done", note: "№ 900123456789012" },
  { id: "passport", name: "Ветпаспорт международный", status: "done" },
  { id: "rabies", name: "Прививка от бешенства", status: "done", note: "15.03.2025" },
  { id: "titers", name: "Титры антител", status: "urgent", deadline: "2025-02-20", note: "Сдать кровь!" },
  { id: "dhpp", name: "Комплексная прививка (DHPP)", status: "done", note: "15.03.2025" },
  { id: "deworming", name: "Обработка от глистов", status: "pending", deadline: "2025-02-25", note: "За 1-5 дней до выезда" },
  { id: "cert", name: "Ветсвидетельство Ф1", status: "pending", deadline: "2025-03-02", note: "Не ранее 5 дней до выезда" },
  { id: "euhealth", name: "EU Health Certificate", status: "na", note: "Получить на границе/в аэропорту" },
];

const getDisplayStatus = (doc: { status: string; deadline?: string }) => {
  if (doc.status === "urgent" || doc.status === "done" || doc.status === "na") return doc.status;
  if (doc.deadline) {
    const days = Math.ceil((new Date(doc.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 3 && days >= 0) return "urgent";
  }
  return "pending";
};

export const Travel = () => {
  const t = useTranslations("travel");
  const { haptic } = useTelegramContext();

  const [docs, setDocs] = useState<Array<TripDocument | (typeof INITIAL_DOCS)[0]>>(INITIAL_DOCS);
  const [trips, setTrips] = useState<TripEvent[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newDocName, setNewDocName] = useState("");

  const fetchTrips = useCallback(async () => {
    setLoadingTrips(true);
    try {
      const res = await fetch(`/api/events?pet_id=${PET_ID}`);
      if (res.ok) {
        const data: TripEvent[] = await res.json();
        setTrips(data.filter((e) => e.type === "trip"));
      }
    } catch {
      // silent
    } finally {
      setLoadingTrips(false);
    }
  }, []);

  const fetchDocs = useCallback(async (eventId: string) => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/trip-documents?event_id=${eventId}`);
      if (res.ok) {
        const data: TripDocument[] = await res.json();
        setDocs(data.length > 0 ? data : INITIAL_DOCS);
      } else {
        setDocs(INITIAL_DOCS);
      }
    } catch {
      setDocs(INITIAL_DOCS);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const activeTrip =
    trips.length > 0 ? trips.find((t) => new Date(t.date) >= new Date()) || trips[0] : null;
  const countdownDate = activeTrip?.date || FALLBACK_TRIP.date;
  const countdownTitle = activeTrip?.title || FALLBACK_TRIP.title;

  useEffect(() => {
    if (activeTrip) {
      fetchDocs(activeTrip.id);
    } else {
      setDocs(INITIAL_DOCS);
    }
  }, [activeTrip?.id, fetchDocs]);

  useEffect(() => {
    const tripDate = new Date(countdownDate);
    const diff = Math.ceil((tripDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    setDaysLeft(Math.max(0, diff));
  }, [countdownDate]);

  const toggleDoc = async (doc: TripDocument | (typeof INITIAL_DOCS)[0]) => {
    haptic.selection();
    if (doc.status === "na") return;
    const newStatus = doc.status === "done" ? "pending" : "done";
    if ("event_id" in doc && doc.event_id) {
      try {
        await fetch("/api/trip-documents", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: doc.id, status: newStatus }),
        });
        setDocs((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: newStatus } : d))
        );
      } catch {
        // silent
      }
    } else {
      setDocs((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status: newStatus } : d))
      );
    }
  };

  const addCustomDoc = async () => {
    if (!newDocName.trim() || !activeTrip) return;
    haptic.impact("medium");
    try {
      const res = await fetch("/api/trip-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: activeTrip.id,
          name: newDocName.trim(),
          status: "pending",
          order: docs.length,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setDocs((prev) => [...prev, created]);
        setNewDocName("");
        setShowAddDoc(false);
      }
    } catch {
      // silent
    }
  };

  const docsWithStatus = docs.map((d) => ({ ...d, displayStatus: getDisplayStatus(d) }));
  const doneCount = docsWithStatus.filter((d) => d.displayStatus === "done").length;
  const totalCheckable = docsWithStatus.filter((d) => d.displayStatus !== "na").length;
  const progress = totalCheckable > 0 ? Math.round((doneCount / totalCheckable) * 100) : 0;

  const urgentDocs = docsWithStatus.filter((d) => d.displayStatus === "urgent");
  const pendingDocs = docsWithStatus.filter((d) => d.displayStatus === "pending");
  const doneDocs = docsWithStatus.filter((d) => d.displayStatus === "done");
  const naDocs = docsWithStatus.filter((d) => d.displayStatus === "na");

  return (
    <div className="space-y-5 animate-fadeIn pb-24">
      {/* Header with countdown */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-3 h-3 text-neutral-500" />
            <span className="text-neutral-400 text-sm">{countdownTitle}</span>
          </div>
        </div>
      </div>

      {/* Countdown Card */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Plane className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-blue-400 text-xs font-medium uppercase tracking-wider">{t("departure")}</p>
              <p className="text-white text-lg font-bold">
                {new Date(countdownDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-400">{daysLeft}</p>
            <p className="text-neutral-500 text-xs">{t("daysWord")}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-neutral-500 text-xs">{t("readiness")}</span>
            <span className="text-white text-xs font-medium">{doneCount}/{totalCheckable}</span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Urgent Section */}
      {urgentDocs.length > 0 && (
        <>
          <SectionHeader title={t("urgentSection")} />
          {urgentDocs.map((doc) => (
            <Card
              key={doc.id}
              className="border-l-4 border-l-red-500 bg-red-500/5 cursor-pointer min-h-[44px]"
              onClick={() => toggleDoc(doc)}
            >
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-white text-sm font-medium">{doc.name}</h3>
                  {doc.note && (
                    <p className="text-red-400 text-xs mt-0.5">{doc.note}</p>
                  )}
                  {doc.deadline && (
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="w-3 h-3 text-red-400" />
                      <span className="text-red-300 text-xs font-medium">
                        {t("deadline")} {new Date(doc.deadline).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0 mt-1" />
              </div>
            </Card>
          ))}
        </>
      )}

      {/* Document Checklist */}
      <SectionHeader
        title={t("docsSection")}
        action={
          activeTrip && (
            <button
              onClick={() => {
                haptic.selection();
                setShowAddDoc(!showAddDoc);
              }}
              className="text-neutral-500 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )
        }
      />

      {showAddDoc && activeTrip && (
        <Card className="flex gap-2">
          <input
            type="text"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            placeholder="Название документа"
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white text-sm focus:border-blue-500 outline-none"
          />
          <button
            onClick={addCustomDoc}
            disabled={!newDocName.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-medium rounded-xl"
          >
            Добавить
          </button>
        </Card>
      )}

      {/* Pending */}
      {pendingDocs.map((doc) => (
        <Card
          key={doc.id}
          onClick={() => toggleDoc(doc)}
          highlight
          className="flex items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{doc.name}</p>
            {doc.note && <p className="text-neutral-500 text-xs truncate">{doc.note}</p>}
            {doc.deadline && (
              <p className="text-amber-400 text-[10px] mt-0.5">
                {t("deadline")} {new Date(doc.deadline).toLocaleDateString("ru-RU")}
              </p>
            )}
          </div>
          <FileText className="w-4 h-4 text-neutral-700 shrink-0" />
        </Card>
      ))}

      {/* Done */}
      {doneDocs.map((doc) => (
        <Card
          key={doc.id}
          onClick={() => toggleDoc(doc)}
          className="flex items-center gap-3 opacity-70 active:scale-[0.98] transition-transform"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-neutral-400 text-sm line-through truncate">{doc.name}</p>
            {doc.note && <p className="text-neutral-600 text-xs truncate">{doc.note}</p>}
          </div>
        </Card>
      ))}

      {/* N/A */}
      {naDocs.map((doc) => (
        <Card key={doc.id} className="flex items-center gap-3 opacity-50">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-neutral-500 text-sm truncate">{doc.name}</p>
            {doc.note && <p className="text-neutral-600 text-xs truncate">{doc.note}</p>}
          </div>
        </Card>
      ))}

      {/* All trips from DB */}
      <SectionHeader
        title={t("tripsSection")}
        action={
          <button
            onClick={() => { haptic.impact("light"); fetchTrips(); }}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingTrips ? "animate-spin" : ""}`} />
          </button>
        }
      />
      {loadingTrips ? (
        <Card className="flex items-center justify-center py-6">
          <RefreshCw className="w-5 h-5 text-neutral-600 animate-spin" />
        </Card>
      ) : trips.length > 0 ? (
        <div className="space-y-2">
          {trips.map(trip => (
            <Card key={trip.id} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Plane className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{trip.title}</p>
                <p className="text-blue-400 text-xs">
                  {new Date(trip.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={googleCalendarUrl({ title: `✈️ ${trip.title}`, date: trip.date, description: "GoBoop — поездка с питомцем" })}
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
                    await fetch("/api/events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: trip.id }) });
                    fetchTrips();
                  }}
                  className="p-1.5 text-neutral-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-6">
          <PlusCircle className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
          <p className="text-neutral-500 text-sm">{t("noTrips")}</p>
          <p className="text-neutral-600 text-xs mt-1">{t("addTripHint")}</p>
        </Card>
      )}
    </div>
  );
};
