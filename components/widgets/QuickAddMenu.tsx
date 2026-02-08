"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  Plane,
  Camera,
  Bell,
  Scale,
  ShoppingBag,
  ScanLine,
  X,
  FileText,
  Paperclip,
  CheckSquare,
  ArrowLeft,
  Send,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  Check,
} from "lucide-react";
import { QuickActionBtn } from "@/components/ui";

const PET_ID = "003ab934-9f93-4f2b-aade-10a6fbc8ca40";
const USER_ID = "demo-user";

interface QuickAddMenuProps {
  showQuickAdd: boolean;
  setShowQuickAdd: (show: boolean) => void;
  quickActionType: string | null;
  setQuickActionType: (type: string | null) => void;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export const QuickAddMenu = ({
  showQuickAdd,
  setShowQuickAdd,
  quickActionType,
  setQuickActionType,
}: QuickAddMenuProps) => {
  const t = useTranslations("quickAdd");
  const tf = useTranslations("forms");

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [tripFrom, setTripFrom] = useState("");
  const [tripTo, setTripTo] = useState("");
  const [tripDate, setTripDate] = useState("");

  const [vetClinic, setVetClinic] = useState("");
  const [vetDate, setVetDate] = useState("");
  const [vetTime, setVetTime] = useState("");

  const [weightTotal, setWeightTotal] = useState("");
  const [weightOwner, setWeightOwner] = useState("");

  const [shoppingTitle, setShoppingTitle] = useState("");

  const [textContent, setTextContent] = useState("");
  const [dateTime, setDateTime] = useState("");

  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  const resetForms = () => {
    setTripFrom(""); setTripTo(""); setTripDate("");
    setVetClinic(""); setVetDate(""); setVetTime("");
    setWeightTotal(""); setWeightOwner("");
    setShoppingTitle("");
    setTextContent(""); setDateTime("");
    setAiInput(""); setAiResult("");
    setSaveStatus("idle"); setErrorMsg("");
  };

  const handleClose = () => {
    setShowQuickAdd(false);
    setTimeout(() => {
      setQuickActionType(null);
      resetForms();
    }, 300);
  };

  const saveToApi = async (endpoint: string, body: Record<string, unknown>) => {
    setSaveStatus("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pet_id: PET_ID, created_by: USER_ID, ...body }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }
      setSaveStatus("saved");
      setTimeout(() => handleClose(), 1200);
    } catch (e) {
      setSaveStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResult("");
    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiInput }),
      });
      const data = await res.json();
      if (data.type && data.type !== "unknown") {
        setAiResult(`✓ ${data.type}: ${JSON.stringify(data.data)}`);
        // Auto-save based on parsed type
        const typeToEndpoint: Record<string, string> = {
          shopping: "shopping",
          weight: "weight",
          note: "notes",
          task: "tasks",
          vet: "events",
          trip: "events",
          reminder: "notes",
        };
        const endpoint = typeToEndpoint[data.type];
        if (endpoint) {
          const saveBody = buildBodyFromAI(data.type, data.data);
          await saveToApi(endpoint, saveBody);
        }
      } else {
        setAiResult("Не удалось распознать команду. Попробуйте другую формулировку.");
      }
    } catch {
      setAiResult("Ошибка AI. Попробуйте позже.");
    } finally {
      setAiLoading(false);
    }
  };

  const buildBodyFromAI = (type: string, data: Record<string, unknown>): Record<string, unknown> => {
    switch (type) {
      case "shopping":
        return { title: data.title || aiInput, price: data.price || null };
      case "weight":
        return { weight_kg: data.weight_kg || 0 };
      case "note":
      case "reminder":
        return { content: data.content || data.title || aiInput };
      case "task":
        return { title: data.title || aiInput, status: "pending" };
      case "vet":
        return { type: "vet", title: data.title || aiInput, date: data.date || new Date().toISOString().split("T")[0] };
      case "trip":
        return { type: "trip", title: data.title || aiInput, date: data.date || new Date().toISOString().split("T")[0] };
      default:
        return { content: aiInput };
    }
  };

  const SaveButton = ({ onClick, color, label }: { onClick: () => void; color: string; label: string }) => (
    <button
      onClick={onClick}
      disabled={saveStatus === "saving" || saveStatus === "saved"}
      className={`w-full py-3 ${saveStatus === "saved" ? "bg-emerald-500" : saveStatus === "saving" ? "bg-neutral-700" : color} text-white font-bold rounded-xl mt-2 flex items-center justify-center gap-2 transition-all disabled:opacity-70`}
    >
      {saveStatus === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
      {saveStatus === "saved" && <Check className="w-4 h-4" />}
      {saveStatus === "saved" ? "Сохранено!" : saveStatus === "saving" ? "Сохранение..." : label}
    </button>
  );

  const ErrorMessage = () =>
    saveStatus === "error" ? (
      <p className="text-red-400 text-xs mt-2 text-center">{errorMsg}</p>
    ) : null;

  const petWeight = weightTotal && weightOwner ? (parseFloat(weightTotal) - parseFloat(weightOwner)).toFixed(1) : null;

  const renderQuickActionContent = () => {
    switch (quickActionType) {
      case "trip":
        return (
          <div className="animate-slideUp">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-400" />
              {tf("trip.title")}
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">{tf("trip.from")}</label>
                  <input type="text" value={tripFrom} onChange={(e) => setTripFrom(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="Тбилиси" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">{tf("trip.to")}</label>
                  <input type="text" value={tripTo} onChange={(e) => setTripTo(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="Берлин" />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">{tf("trip.date")}</label>
                <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" />
              </div>
              <SaveButton onClick={() => saveToApi("events", { type: "trip", title: `${tripFrom} → ${tripTo}`, date: tripDate || new Date().toISOString().split("T")[0] })} color="bg-blue-500" label={tf("trip.submit")} />
              <ErrorMessage />
            </div>
          </div>
        );
      case "vet":
        return (
          <div className="animate-slideUp">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              {tf("vet.title")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">{tf("vet.clinic")}</label>
                <input type="text" value={vetClinic} onChange={(e) => setVetClinic(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none" placeholder={tf("vet.clinicPlaceholder")} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">{tf("vet.date")}</label>
                  <input type="date" value={vetDate} onChange={(e) => setVetDate(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">{tf("vet.time")}</label>
                  <input type="time" value={vetTime} onChange={(e) => setVetTime(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none" />
                </div>
              </div>
              <SaveButton onClick={() => saveToApi("events", { type: "vet", title: vetClinic || "Визит к врачу", date: vetDate || new Date().toISOString().split("T")[0], time: vetTime || null, location: vetClinic })} color="bg-rose-500" label={tf("vet.submit")} />
              <ErrorMessage />
            </div>
          </div>
        );
      case "weight":
        return (
          <div className="animate-slideUp">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              {tf("weight.title")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-500 block mb-1">{tf("weight.step1")}</label>
                <input type="number" step="0.1" value={weightTotal} onChange={(e) => setWeightTotal(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500" placeholder="0.0 кг" />
              </div>
              <div>
                <label className="text-xs text-neutral-500 block mb-1">{tf("weight.step2")}</label>
                <input type="number" step="0.1" value={weightOwner} onChange={(e) => setWeightOwner(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500" placeholder="0.0 кг" />
              </div>
              <div className="p-3 bg-emerald-900/20 border border-emerald-900 rounded-xl text-center">
                <div className="text-xs text-emerald-500 uppercase tracking-wide">{tf("weight.result")}</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {petWeight ? `${petWeight} kg` : "-- kg"}
                </div>
              </div>
              <SaveButton onClick={() => { if (petWeight) saveToApi("weight", { weight_kg: parseFloat(petWeight) }); }} color="bg-emerald-500" label={tf("weight.submit")} />
              <ErrorMessage />
            </div>
          </div>
        );
      case "shopping":
        return (
          <div className="animate-slideUp">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {tf("shopping.title")}
            </h3>
            <div className="space-y-4">
              <input type="text" value={shoppingTitle} onChange={(e) => setShoppingTitle(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none" placeholder={tf("shopping.placeholder")} />
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300 flex items-center justify-center gap-2">
                  <ScanLine className="w-4 h-4" /> {tf("shopping.scan")}
                </button>
                <button onClick={() => { if (shoppingTitle.trim()) saveToApi("shopping", { title: shoppingTitle }); }} disabled={saveStatus === "saving" || saveStatus === "saved"} className={`flex-1 py-3 ${saveStatus === "saved" ? "bg-emerald-500" : "bg-amber-500"} text-black font-bold rounded-xl flex items-center justify-center gap-2`}>
                  {saveStatus === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saveStatus === "saved" && <Check className="w-4 h-4" />}
                  {saveStatus === "saved" ? "✓" : tf("shopping.submit")}
                </button>
              </div>
              <ErrorMessage />
            </div>
          </div>
        );
      case "note":
      case "task":
      case "reminder":
        return (
          <div className="animate-slideUp">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              {quickActionType === "note" && <FileText className="w-5 h-5 text-purple-400" />}
              {quickActionType === "task" && <CheckSquare className="w-5 h-5 text-purple-400" />}
              {quickActionType === "reminder" && <Bell className="w-5 h-5 text-purple-400" />}
              {tf(`${quickActionType}.title`)}
            </h3>
            <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white h-32 resize-none focus:border-purple-500 outline-none" placeholder={tf(`${quickActionType}.placeholder`)} />
            <div className="flex gap-2 mt-4">
              {quickActionType !== "note" && (
                <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-neutral-400 text-xs flex-1 outline-none" />
              )}
              <SaveButton
                onClick={() => {
                  if (!textContent.trim()) return;
                  if (quickActionType === "task") {
                    saveToApi("tasks", { title: textContent, due_date: dateTime ? dateTime.split("T")[0] : null, status: "pending" });
                  } else {
                    saveToApi("notes", { content: textContent });
                  }
                }}
                color="bg-purple-500"
                label={tf(`${quickActionType}.submit`)}
              />
            </div>
            <ErrorMessage />
          </div>
        );
      case "photo":
      case "file":
        return (
          <div className="animate-slideUp flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-dashed border-neutral-600 flex items-center justify-center mb-4">
              {quickActionType === "photo" ? <Camera className="w-8 h-8 text-neutral-500" /> : <Paperclip className="w-8 h-8 text-neutral-500" />}
            </div>
            <p className="text-neutral-400 text-sm text-center mb-6">
              {quickActionType === "photo" ? tf("photo.description") : tf("fileUpload.description")}
            </p>
            <button className="w-full py-3 bg-neutral-800 border border-neutral-700 text-white font-medium rounded-xl">
              {quickActionType === "photo" ? tf("photo.open") : tf("fileUpload.open")}
            </button>
          </div>
        );
      default:
        return (
          <>
            {/* AI Input */}
            <div className="mb-6 relative shrink-0 animate-slideUp">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Sparkles className={`h-5 w-5 text-amber-400 ${aiLoading ? "animate-spin" : "animate-pulse"}`} />
              </div>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiParse()}
                className="block w-full pl-10 pr-12 py-4 bg-neutral-900 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
                placeholder={t("aiPlaceholder")}
                disabled={aiLoading}
              />
              <button onClick={handleAiParse} disabled={aiLoading} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="p-2 bg-amber-500 rounded-xl text-black hover:bg-amber-400 transition-colors">
                  <Send className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* AI Result */}
            {aiResult && (
              <div className={`mb-4 p-3 rounded-xl text-xs ${saveStatus === "saved" ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800" : "bg-neutral-800 text-neutral-300 border border-neutral-700"}`}>
                {aiResult}
              </div>
            )}

            {/* Quick Action Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 overflow-y-auto pb-4 custom-scrollbar animate-slideUp">
              <QuickActionBtn onClick={() => setQuickActionType("trip")} icon={Plane} label={t("trip")} color="text-blue-400" bg="bg-blue-500/10" delay="0" />
              <QuickActionBtn onClick={() => setQuickActionType("vet")} icon={Activity} label={t("vet")} color="text-rose-400" bg="bg-rose-500/10" delay="50" />
              <QuickActionBtn onClick={() => setQuickActionType("photo")} icon={ImageIcon} label={t("photo")} color="text-neutral-200" bg="bg-neutral-700/50" delay="100" />
              <QuickActionBtn onClick={() => setQuickActionType("file")} icon={Paperclip} label={t("file")} color="text-neutral-400" bg="bg-neutral-800" delay="150" />
              <QuickActionBtn onClick={() => setQuickActionType("shopping")} icon={ShoppingBag} label={t("shopping")} color="text-amber-400" bg="bg-amber-500/10" delay="200" />
              <QuickActionBtn onClick={() => setQuickActionType("note")} icon={FileText} label={t("note")} color="text-purple-400" bg="bg-purple-500/10" delay="250" />
              <QuickActionBtn onClick={() => setQuickActionType("reminder")} icon={Bell} label={t("reminder")} color="text-lime-400" bg="bg-lime-500/10" delay="300" />
              <QuickActionBtn onClick={() => setQuickActionType("task")} icon={CheckSquare} label={t("task")} color="text-cyan-400" bg="bg-cyan-500/10" delay="350" />
              <QuickActionBtn onClick={() => setQuickActionType("weight")} icon={Scale} label={t("weight")} color="text-emerald-400" bg="bg-emerald-500/10" delay="400" />
            </div>
          </>
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-md transition-opacity duration-300 ${showQuickAdd ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#1E1E1E] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-neutral-800 shadow-2xl transform transition-transform duration-300 flex flex-col max-h-[90vh] ${showQuickAdd ? "translate-y-0" : "translate-y-full sm:translate-y-10"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-2">
            {quickActionType && (
              <button
                onClick={() => { setQuickActionType(null); resetForms(); }}
                className="p-1 -ml-2 rounded-full hover:bg-neutral-800 text-neutral-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-white text-lg font-bold">
              {quickActionType ? " " : t("title")}
            </h3>
          </div>
          <button onClick={handleClose} className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderQuickActionContent()}
      </div>
    </div>
  );
};
