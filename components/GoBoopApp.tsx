"use client";

// #region agent log
const log = (msg: string, data?: object) => {
  fetch("http://127.0.0.1:7243/ingest/1e0bdbe2-926d-4093-9cba-195f03892070", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location: "GoBoopApp.tsx", message: msg, data: data ?? {}, timestamp: Date.now() }),
  }).catch(() => {});
};
// #endregion

import React, { useState, useEffect, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  Heart,
  Activity,
  Users,
  Plane,
  Plus,
  Camera,
  Bell,
  CheckCircle,
  AlertCircle,
  Scale,
  MapPin,
  ShoppingBag,
  ScanLine,
  Clock,
  ChevronRight,
  Trophy,
  Zap,
  X,
  FileText,
  Paperclip,
  CheckSquare,
  ArrowLeft,
  Send,
  Sparkles,
  Image as ImageIcon,
  Home,
} from "lucide-react";

// --- UI components (Luxe Design System) ---

const Card = ({
  children,
  className = "",
  onClick,
  highlight = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  highlight?: boolean;
}) => (
  <div
    onClick={onClick}
    className={`
      relative overflow-hidden rounded-2xl p-4 transition-all duration-300
      ${onClick ? "cursor-pointer active:scale-[0.98]" : ""}
      ${
        highlight
          ? "bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 shadow-lg shadow-black/50"
          : "bg-[#1A1A1A] border border-neutral-800"
      }
      ${className}
    `}
  >
    {children}
  </div>
);

const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) => (
  <div className="flex justify-between items-center mb-3 mt-6 px-1">
    <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
      {title}
    </h2>
    {action}
  </div>
);

// --- Main App ---

export default function GoBoopApp() {
  // #region agent log
  log("GoBoopApp-render-start", {});
  useEffect(() => {
    log("GoBoopApp-mounted", {});
  }, []);
  // #endregion
  const [activeTab, setActiveTab] = useLocalStorage("goboop_activeTab", "dashboard");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickActionType, setQuickActionType] = useState<string | null>(null);
  const [happiness, setHappiness] = useLocalStorage("goboop_happiness", 85);

  // Store lastWalkTime as ISO string for JSON serialization
  const [lastWalkTimeISO, setLastWalkTimeISO] = useLocalStorage(
    "goboop_lastWalkTime",
    new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  );
  const lastWalkTime = useMemo(() => new Date(lastWalkTimeISO), [lastWalkTimeISO]);
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
    setLastWalkTime(new Date());
    setHappiness((prev) => Math.min(100, prev + 5));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHappiness((prev) =>
        Math.max(80, Math.min(95, prev + (Math.random() > 0.5 ? 1 : -1)))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!showQuickAdd) {
      setTimeout(() => setQuickActionType(null), 300);
    }
  }, [showQuickAdd]);

  // --- Screens ---

  const Dashboard = () => (
    <div className="space-y-4 animate-fadeIn pb-24">
      <div className="relative pt-2 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Арчи
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-neutral-400 text-sm">Дома, отдыхает</span>
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
              Индекс счастья
            </span>
          </div>
        </div>
      </div>

      <Card className="border-l-4 border-l-lime-500">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-lime-500/10 rounded-lg">
              <MapPin className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Прогулки</h3>
              <p className="text-lime-400 text-xs font-medium">
                Цель: 2 раза в день
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleWalkDone}
          className="w-full bg-neutral-800 hover:bg-neutral-700 border border-lime-500/30 rounded-xl p-4 flex items-center justify-between transition-all active:scale-[0.98] group mb-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lime-500/20 flex items-center justify-center group-hover:bg-lime-500/30 transition-colors">
              <CheckCircle className="w-5 h-5 text-lime-400" />
            </div>
            <div className="text-left">
              <span className="text-white font-medium block">
                Прогулка сделана
              </span>
              <span className="text-neutral-500 text-xs">
                Нажмите, чтобы отметить
              </span>
            </div>
          </div>
          <div className="text-right bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="text-xs text-neutral-400 block mb-0.5">
              Прошло времени
            </span>
            <span className="text-lime-400 font-mono font-bold text-sm">
              {timeSinceWalk}
            </span>
          </div>
        </button>

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
              <span className="text-[10px] text-lime-400 block">Сейчас</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 rounded-xl p-3 border border-dashed border-neutral-700 flex gap-3 items-center">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <p className="text-neutral-300 text-xs font-medium">
              Идея для прогулки
            </p>
            <p className="text-neutral-500 text-[10px]">
              Возьмите кликер, учим команду &quot;Рядом&quot; (5 мин)
            </p>
          </div>
        </div>
      </Card>

      <SectionHeader title="События" />
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
          <p className="text-neutral-400 text-xs mb-0.5">Визит к врачу</p>
          <p className="text-white font-medium text-sm">Завтра, 15:00</p>
          <p className="text-rose-400 text-[10px] mt-1">Осмотр ушей</p>
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
          <p className="text-neutral-400 text-xs mb-0.5">Берлин</p>
          <p className="text-white font-medium text-sm">Через 24 дня</p>
          <div className="flex items-center gap-1 mt-2 bg-blue-900/30 px-2 py-1 rounded w-fit">
            <AlertCircle className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-blue-200">Сдать титры!</span>
          </div>
        </Card>
      </div>

      <SectionHeader
        title="Семья"
        action={
          <span
            onClick={() => navigateTo("family")}
            className="text-xs text-neutral-500 cursor-pointer"
          >
            Подробнее
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
            <p className="text-white text-sm font-medium">Муж — молодец!</p>
            <p className="text-neutral-500 text-xs">
              Выполнил утреннюю рутину
            </p>
          </div>
        </div>
        <Trophy className="w-5 h-5 text-amber-500/50" />
      </Card>
    </div>
  );

  const Health = () => (
    <div className="space-y-6 animate-fadeIn pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Здоровье</h1>
      </div>
      <Card className="border-l-4 border-l-rose-500 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-white font-medium text-lg">Визит к врачу</h2>
            <p className="text-rose-400 text-sm">Завтра в 15:00</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-500 block">Осталось</span>
            <span className="text-white font-mono">19ч</span>
          </div>
        </div>
        <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3 h-3 text-neutral-500" />
            <span className="text-neutral-300 text-xs">
              Ветклиника &quot;Белый Клык&quot;
            </span>
          </div>
          <p className="text-neutral-400 text-xs pl-5">
            Др. Смирнова (Терапевт)
          </p>
        </div>
      </Card>
    </div>
  );

  const Travel = () => (
    <div className="space-y-6 animate-fadeIn pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          Тбилиси <span className="text-neutral-600">→</span> Берлин
        </h1>
        <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
          24 дня
        </div>
      </div>
      <SectionHeader title="Важно сделать сейчас" />
      <Card className="border-l-4 border-l-red-500 bg-red-500/5">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white text-sm font-medium">
              Сдать титры на антитела
            </h3>
            <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
              Срок истекает через 48 часов!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const Family = () => (
    <div className="space-y-6 animate-fadeIn pb-24">
      <h1 className="text-2xl font-bold text-white">Семья</h1>
      <Card className="bg-gradient-to-b from-neutral-800 to-neutral-900 border-neutral-700">
        <div className="text-center mb-6">
          <h2 className="text-amber-400 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" /> Чемпион недели
          </h2>
        </div>
        <div className="flex justify-center items-end gap-6 mb-8">
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-neutral-700 border-4 border-neutral-800 flex items-center justify-center text-neutral-300 font-bold transition-transform group-hover:scale-110">
              Я
            </div>
            <div className="h-20 w-14 bg-neutral-800 rounded-t-lg flex items-end justify-center pb-2">
              <span className="text-sm font-bold text-neutral-500">2</span>
            </div>
            <span className="text-neutral-500 text-xs font-mono">240 XP</span>
          </div>

          <div className="flex flex-col items-center gap-2 relative z-10">
            <div className="absolute -top-8 animate-bounce text-2xl">👑</div>
            <div className="w-20 h-20 rounded-full bg-neutral-700 border-4 border-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              Муж
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

  // --- Quick Add Logic ---

  const renderQuickActionContent = () => {
    switch (quickActionType) {
      case "trip":
        return (
          <div className="animate-slideUp">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-400" />
              Запланировать поездку
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">
                    Откуда
                  </label>
                  <input
                    type="text"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                    placeholder="Тбилиси"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">
                    Куда
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
                  Дата выезда
                </label>
                <input
                  type="date"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <button className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl mt-2">
                Создать маршрут
              </button>
            </div>
          </div>
        );
      case "vet":
        return (
          <div className="animate-slideUp">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              Визит к врачу
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">
                  Клиника / Врач
                </label>
                <input
                  type="text"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none"
                  placeholder="Например: Белый Клык"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">
                    Дата
                  </label>
                  <input
                    type="date"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">
                    Время
                  </label>
                  <input
                    type="time"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-rose-500 outline-none"
                  />
                </div>
              </div>
              <button className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl mt-2">
                Записать
              </button>
            </div>
          </div>
        );
      case "weight":
        return (
          <div className="animate-slideUp">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              Добавить вес
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-500 block mb-1">
                  Шаг 1: Общий вес (Вы + Питомц)
                </label>
                <input
                  type="number"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="0.0 кг"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 block mb-1">
                  Шаг 2: Ваш вес
                </label>
                <input
                  type="number"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="0.0 кг"
                />
              </div>
              <div className="p-3 bg-emerald-900/20 border border-emerald-900 rounded-xl text-center">
                <div className="text-xs text-emerald-500 uppercase tracking-wide">
                  Результат
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  -- kg
                </div>
              </div>
              <button className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl mt-2">
                Сохранить
              </button>
            </div>
          </div>
        );
      case "shopping":
        return (
          <div className="animate-slideUp">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              Добавить покупку
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
                placeholder="Что купить? (Корм, игрушка)"
              />
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-300 flex items-center justify-center gap-2">
                  <ScanLine className="w-4 h-4" /> Скан чека
                </button>
                <button className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl">
                  Добавить
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
              {quickActionType === "note"
                ? "Новая заметка"
                : quickActionType === "task"
                  ? "Новая задача"
                  : "Напоминание"}
            </h3>
            <textarea
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white h-32 resize-none focus:border-purple-500 outline-none"
              placeholder="Напишите что-нибудь..."
            ></textarea>
            <div className="flex gap-2 mt-4">
              {quickActionType !== "note" && (
                <input
                  type="datetime-local"
                  className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-neutral-400 text-xs flex-1 outline-none"
                />
              )}
              <button className="flex-1 py-3 bg-purple-500 text-white font-bold rounded-xl">
                Сохранить
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
                ? "Сделать фото или выбрать из галереи"
                : "Прикрепить файл PDF или DOC"}
            </p>
            <button className="w-full py-3 bg-neutral-800 border border-neutral-700 text-white font-medium rounded-xl">
              Открыть {quickActionType === "photo" ? "камеру" : "файлы"}
            </button>
          </div>
        );
      default:
        return (
          <>
            <div className="mb-6 relative shrink-0 animate-slideUp">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-12 py-4 bg-neutral-900 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
                placeholder="Спроси AI или скажи, что случилось..."
              />
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="p-2 bg-amber-500 rounded-xl text-black hover:bg-amber-400 transition-colors">
                  <Send className="w-4 h-4" />
                </div>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 overflow-y-auto pb-4 custom-scrollbar animate-slideUp">
              <QuickActionBtn
                onClick={() => setQuickActionType("trip")}
                icon={Plane}
                label="Поездка"
                color="text-blue-400"
                bg="bg-blue-500/10"
                delay="0"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("vet")}
                icon={Activity}
                label="Врач"
                color="text-rose-400"
                bg="bg-rose-500/10"
                delay="50"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("photo")}
                icon={ImageIcon}
                label="Фото"
                color="text-neutral-200"
                bg="bg-neutral-700/50"
                delay="100"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("file")}
                icon={Paperclip}
                label="Файл"
                color="text-neutral-400"
                bg="bg-neutral-800"
                delay="150"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("shopping")}
                icon={ShoppingBag}
                label="Покупка"
                color="text-amber-400"
                bg="bg-amber-500/10"
                delay="200"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("note")}
                icon={FileText}
                label="Заметка"
                color="text-purple-400"
                bg="bg-purple-500/10"
                delay="250"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("reminder")}
                icon={Bell}
                label="Напоминание"
                color="text-lime-400"
                bg="bg-lime-500/10"
                delay="300"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("task")}
                icon={CheckSquare}
                label="Задача"
                color="text-cyan-400"
                bg="bg-cyan-500/10"
                delay="350"
              />
              <QuickActionBtn
                onClick={() => setQuickActionType("weight")}
                icon={Scale}
                label="Вес"
                color="text-emerald-400"
                bg="bg-emerald-500/10"
                delay="400"
              />
            </div>
          </>
        );
    }
  };

  const QuickAddMenu = () => (
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
              {quickActionType ? " " : "Быстрое действие"}
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

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-200 font-sans selection:bg-rose-500/30">
      <QuickAddMenu />

      <div className="max-w-md mx-auto min-h-screen relative flex flex-col">
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "health" && <Health />}
          {activeTab === "travel" && <Travel />}
          {activeTab === "family" && <Family />}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-[#121212]/90 backdrop-blur-xl border-t border-white/5 pb-safe z-50">
          <div className="max-w-md mx-auto flex justify-around items-center p-2">
            <NavButton
              icon={Home}
              label="Главная"
              isActive={activeTab === "dashboard"}
              onClick={() => navigateTo("dashboard")}
            />
            <NavButton
              icon={Activity}
              label="Здоровье"
              isActive={activeTab === "health"}
              onClick={() => navigateTo("health")}
            />
            <div className="relative -top-6">
              <button
                onClick={() => setShowQuickAdd(true)}
                className={`w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] transform transition-all duration-300 hover:scale-105 active:scale-95 ${showQuickAdd ? "rotate-45" : ""}`}
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <NavButton
              icon={Plane}
              label="Поездки"
              isActive={activeTab === "travel"}
              onClick={() => navigateTo("travel")}
            />
            <NavButton
              icon={Users}
              label="Семья"
              isActive={activeTab === "family"}
              onClick={() => navigateTo("family")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const NavButton = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-12 gap-1 transition-all duration-300 ${isActive ? "text-white" : "text-neutral-600 hover:text-neutral-400"}`}
  >
    <Icon
      className={`w-6 h-6 transition-all ${isActive ? "fill-current scale-110" : ""}`}
      strokeWidth={isActive ? 2.5 : 1.5}
    />
    <span
      className={`text-[10px] font-medium transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}
    >
      {label}
    </span>
  </button>
);

const QuickActionBtn = ({
  icon: Icon,
  label,
  color,
  bg,
  onClick,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
  onClick: () => void;
  delay: string;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 group animate-scaleIn"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 border border-transparent group-hover:border-white/10`}
    >
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <span className="text-[10px] text-neutral-400 font-medium group-hover:text-white transition-colors">
      {label}
    </span>
  </button>
);
