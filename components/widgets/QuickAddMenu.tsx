"use client";

import React from "react";
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
} from "lucide-react";
import { QuickActionBtn } from "@/components/ui";

interface QuickAddMenuProps {
  showQuickAdd: boolean;
  setShowQuickAdd: (show: boolean) => void;
  quickActionType: string | null;
  setQuickActionType: (type: string | null) => void;
}

export const QuickAddMenu = ({
  showQuickAdd,
  setShowQuickAdd,
  quickActionType,
  setQuickActionType,
}: QuickAddMenuProps) => {
  const t = useTranslations("quickAdd");
  const tf = useTranslations("forms");

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
                  <label className="text-xs text-neutral-500 mb-1 block">
                    {tf("trip.from")}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                    placeholder="Тбилиси"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">
                    {tf("trip.to")}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                    placeholder="Берлин"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">
                  {tf("trip.date")}
                </label>
                <input
                  type="date"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <button className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl mt-2">
                {tf("trip.submit")}
              </button>
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
                <label className="text-xs text-neutral-500 mb-1 block">
                  {tf("vet.clinic")}
                </label>
                <input
                  type="text"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none"
                  placeholder={tf("vet.clinicPlaceholder")}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">
                    {tf("vet.date")}
                  </label>
                  <input
                    type="date"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">
                    {tf("vet.time")}
                  </label>
                  <input
                    type="time"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none"
                  />
                </div>
              </div>
              <button className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl mt-2">
                {tf("vet.submit")}
              </button>
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
                <label className="text-xs text-neutral-500 block mb-1">
                  {tf("weight.step1")}
                </label>
                <input
                  type="number"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="0.0 кг"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 block mb-1">
                  {tf("weight.step2")}
                </label>
                <input
                  type="number"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="0.0 кг"
                />
              </div>
              <div className="p-3 bg-emerald-900/20 border border-emerald-900 rounded-xl text-center">
                <div className="text-xs text-emerald-500 uppercase tracking-wide">
                  {tf("weight.result")}
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  -- kg
                </div>
              </div>
              <button className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl mt-2">
                {tf("weight.submit")}
              </button>
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
              <input
                type="text"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                placeholder={tf("shopping.placeholder")}
              />
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300 flex items-center justify-center gap-2">
                  <ScanLine className="w-4 h-4" /> {tf("shopping.scan")}
                </button>
                <button className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl">
                  {tf("shopping.submit")}
                </button>
              </div>
            </div>
          </div>
        );
      case "note":
      case "task":
      case "reminder":
        return (
          <div className="animate-slideUp">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              {quickActionType === "note" && (
                <FileText className="w-5 h-5 text-purple-400" />
              )}
              {quickActionType === "task" && (
                <CheckSquare className="w-5 h-5 text-purple-400" />
              )}
              {quickActionType === "reminder" && (
                <Bell className="w-5 h-5 text-purple-400" />
              )}
              {tf(`${quickActionType}.title`)}
            </h3>
            <textarea
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white h-32 resize-none focus:border-purple-500 outline-none"
              placeholder={tf(`${quickActionType}.placeholder`)}
            ></textarea>
            <div className="flex gap-2 mt-4">
              {quickActionType !== "note" && (
                <input
                  type="datetime-local"
                  className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-neutral-400 text-xs flex-1 outline-none"
                />
              )}
              <button className="flex-1 py-3 bg-purple-500 text-white font-bold rounded-xl">
                {tf(`${quickActionType}.submit`)}
              </button>
            </div>
          </div>
        );
      case "photo":
      case "file":
        return (
          <div className="animate-slideUp flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-dashed border-neutral-600 flex items-center justify-center mb-4">
              {quickActionType === "photo" ? (
                <Camera className="w-8 h-8 text-neutral-500" />
              ) : (
                <Paperclip className="w-8 h-8 text-neutral-500" />
              )}
            </div>
            <p className="text-neutral-400 text-sm text-center mb-6">
              {quickActionType === "photo"
                ? tf("photo.description")
                : tf("fileUpload.description")}
            </p>
            <button className="w-full py-3 bg-neutral-800 border border-neutral-700 text-white font-medium rounded-xl">
              {quickActionType === "photo"
                ? tf("photo.open")
                : tf("fileUpload.open")}
            </button>
          </div>
        );
      default:
        return (
          <>
            {/* AI Input */}
            <div className="mb-6 relative shrink-0 animate-slideUp">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-12 py-4 bg-neutral-900 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
                placeholder={t("aiPlaceholder")}
              />
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="p-2 bg-amber-500 rounded-xl text-black hover:bg-amber-400 transition-colors">
                  <Send className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 overflow-y-auto pb-4 custom-scrollbar animate-slideUp">
              <QuickActionBtn
                onClick={() => setQuickActionType("trip")}
                icon={Plane}
                label={t("trip")}
                color="text-blue-400"
                bg="bg-blue-500/10"
                delay="0"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("vet")}
                icon={Activity}
                label={t("vet")}
                color="text-rose-400"
                bg="bg-rose-500/10"
                delay="50"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("photo")}
                icon={ImageIcon}
                label={t("photo")}
                color="text-neutral-200"
                bg="bg-neutral-700/50"
                delay="100"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("file")}
                icon={Paperclip}
                label={t("file")}
                color="text-neutral-400"
                bg="bg-neutral-800"
                delay="150"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("shopping")}
                icon={ShoppingBag}
                label={t("shopping")}
                color="text-amber-400"
                bg="bg-amber-500/10"
                delay="200"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("note")}
                icon={FileText}
                label={t("note")}
                color="text-purple-400"
                bg="bg-purple-500/10"
                delay="250"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("reminder")}
                icon={Bell}
                label={t("reminder")}
                color="text-lime-400"
                bg="bg-lime-500/10"
                delay="300"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("task")}
                icon={CheckSquare}
                label={t("task")}
                color="text-cyan-400"
                bg="bg-cyan-500/10"
                delay="350"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("weight")}
                icon={Scale}
                label={t("weight")}
                color="text-emerald-400"
                bg="bg-emerald-500/10"
                delay="400"
              />
            </div>
          </>
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-md transition-opacity duration-300 ${showQuickAdd ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={() => setShowQuickAdd(false)}
    >
      <div
        className={`bg-[#1E1E1E] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-neutral-800 shadow-2xl transform transition-transform duration-300 flex flex-col max-h-[90vh] ${showQuickAdd ? "translate-y-0" : "translate-y-full sm:translate-y-10"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-2">
            {quickActionType && (
              <button
                onClick={() => setQuickActionType(null)}
                className="p-1 -ml-2 rounded-full hover:bg-neutral-800 text-neutral-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="text-white text-lg font-bold">
              {quickActionType ? " " : t("title")}
            </h3>
          </div>
          <button
            onClick={() => setShowQuickAdd(false)}
            className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderQuickActionContent()}
      </div>
    </div>
  );
};
