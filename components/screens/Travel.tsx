"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import { useTelegramContext } from "@/components/TelegramProvider";

// Demo trip data (will be DB-driven later)
const TRIP = {
  from: "Тбилиси",
  to: "Берлин",
  date: "2025-03-05",
  transport: "Самолёт",
};

type DocStatus = "done" | "urgent" | "pending" | "na";

interface DocItem {
  id: string;
  name: string;
  status: DocStatus;
  note?: string;
  deadline?: string;
}

const INITIAL_DOCS: DocItem[] = [
  { id: "chip", name: "Микрочип (ISO 11784)", status: "done", note: "№ 900123456789012" },
  { id: "passport", name: "Ветпаспорт международный", status: "done" },
  { id: "rabies", name: "Прививка от бешенства", status: "done", note: "15.03.2025" },
  { id: "titers", name: "Титры антител", status: "urgent", deadline: "2025-02-20", note: "Сдать кровь!" },
  { id: "dhpp", name: "Комплексная прививка (DHPP)", status: "done", note: "15.03.2025" },
  { id: "deworming", name: "Обработка от глистов", status: "pending", deadline: "2025-02-25", note: "За 1-5 дней до выезда" },
  { id: "cert", name: "Ветсвидетельство Ф1", status: "pending", deadline: "2025-03-02", note: "Не ранее 5 дней до выезда" },
  { id: "euhealth", name: "EU Health Certificate", status: "na", note: "Получить на границе/в аэропорту" },
];

export const Travel = () => {
  const t = useTranslations("travel");
  const { haptic } = useTelegramContext();

  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const tripDate = new Date(TRIP.date);
    const now = new Date();
    const diff = Math.ceil((tripDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setDaysLeft(Math.max(0, diff));
  }, []);

  const toggleDoc = (id: string) => {
    haptic.selection();
    setDocs(prev => prev.map(d => {
      if (d.id !== id) return d;
      if (d.status === "done") return { ...d, status: "pending" as DocStatus };
      if (d.status === "na") return d; // Can't toggle N/A
      return { ...d, status: "done" as DocStatus };
    }));
  };

  const doneCount = docs.filter(d => d.status === "done").length;
  const totalCheckable = docs.filter(d => d.status !== "na").length;
  const progress = totalCheckable > 0 ? Math.round((doneCount / totalCheckable) * 100) : 0;

  const urgentDocs = docs.filter(d => d.status === "urgent");
  const pendingDocs = docs.filter(d => d.status === "pending");
  const doneDocs = docs.filter(d => d.status === "done");
  const naDocs = docs.filter(d => d.status === "na");

  return (
    <div className="space-y-5 animate-fadeIn pb-24">
      {/* Header with countdown */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-3 h-3 text-neutral-500" />
            <span className="text-neutral-400 text-sm">{TRIP.from} → {TRIP.to}</span>
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
                {new Date(TRIP.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
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
          {urgentDocs.map(doc => (
            <Card
              key={doc.id}
              className="border-l-4 border-l-red-500 bg-red-500/5"
              onClick={() => toggleDoc(doc.id)}
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
      <SectionHeader title={t("docsSection")} />

      {/* Pending */}
      {pendingDocs.map(doc => (
        <Card
          key={doc.id}
          onClick={() => toggleDoc(doc.id)}
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
      {doneDocs.map(doc => (
        <Card
          key={doc.id}
          onClick={() => toggleDoc(doc.id)}
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
      {naDocs.map(doc => (
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
    </div>
  );
};
