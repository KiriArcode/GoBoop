"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Trophy,
  CheckCircle,
  Circle,
  Clock,
  Zap,
  RefreshCw,
  Users,
  PawPrint,
} from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import { useTelegramContext } from "@/components/TelegramProvider";

const PET_ID = "003ab934-9f93-4f2b-aade-10a6fbc8ca40";

interface Task {
  id: string;
  title: string;
  status: "pending" | "done" | "overdue";
  assigned_to: string | null;
  due_date: string | null;
  xp_reward: number;
  created_by: string;
  completed_at: string | null;
}

// Demo family members (will be DB-driven later)
const FAMILY_MEMBERS = [
  { id: "husband", name: "Муж", avatar: "М", xp: 450, color: "border-amber-500" },
  { id: "demo-user", name: "Я", avatar: "Я", xp: 240, color: "border-blue-500" },
];

// Demo activity feed
const ACTIVITIES = [
  { who: "Муж", what: "выгулял Арчи", when: "30 мин назад", xp: 15 },
  { who: "Я", what: "добавила покупку: Корм", when: "2 ч назад", xp: 5 },
  { who: "Муж", what: "дал таблетку от глистов", when: "вчера", xp: 20 },
  { who: "Я", what: "записала к ветеринару", when: "вчера", xp: 10 },
];

export const Family = () => {
  const t = useTranslations("family");
  const { haptic } = useTelegramContext();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`/api/tasks?pet_id=${PET_ID}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      // silent
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTask = async (task: Task) => {
    haptic.impact("medium");
    const newStatus = task.status === "done" ? "pending" : "done";
    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    ));
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      });
      haptic.notification("success");
    } catch {
      // Revert
      setTasks(prev => prev.map(t =>
        t.id === task.id ? { ...t, status: task.status } : t
      ));
      haptic.notification("error");
    }
  };

  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "overdue");
  const doneTasks = tasks.filter(t => t.status === "done");
  const sortedMembers = [...FAMILY_MEMBERS].sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-5 animate-fadeIn pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <div className="flex items-center gap-1 text-neutral-500 text-xs">
          <Users className="w-3 h-3" />
          <span>{FAMILY_MEMBERS.length} {t("members")}</span>
        </div>
      </div>

      {/* Leaderboard */}
      <Card className="bg-gradient-to-b from-neutral-800 to-neutral-900 border-neutral-700">
        <div className="text-center mb-5">
          <h2 className="text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" /> {t("champion")}
          </h2>
        </div>
        <div className="flex justify-center items-end gap-6 mb-4">
          {sortedMembers.map((member, i) => {
            const isFirst = i === 0;
            return (
              <div key={member.id} className="flex flex-col items-center gap-2 group">
                {isFirst && (
                  <div className="animate-bounce text-2xl">&#x1F451;</div>
                )}
                <div className={`${isFirst ? "w-20 h-20" : "w-14 h-14"} rounded-full bg-neutral-700 ${member.color} ${isFirst ? "border-4" : "border-3 border-neutral-600"} flex items-center justify-center ${isFirst ? "text-white text-lg" : "text-neutral-300"} font-bold ${isFirst ? "shadow-[0_0_20px_rgba(245,158,11,0.3)]" : ""} transition-transform group-hover:scale-110`}>
                  {member.avatar}
                </div>
                <div className={`${isFirst ? "h-32 w-16" : "h-20 w-14"} ${isFirst ? "bg-gradient-to-t from-amber-600/20 to-amber-500/10 border-x border-t border-amber-500/30" : "bg-neutral-800"} rounded-t-lg flex items-end justify-center ${isFirst ? "pb-4" : "pb-2"} backdrop-blur-sm`}>
                  <span className={`${isFirst ? "text-2xl text-amber-500" : "text-sm text-neutral-500"} font-bold`}>
                    {i + 1}
                  </span>
                </div>
                <div className="text-center">
                  <p className={`text-xs font-medium ${isFirst ? "text-white" : "text-neutral-400"}`}>{member.name}</p>
                  <p className={`text-xs font-mono font-bold ${isFirst ? "text-amber-400" : "text-neutral-500"}`}>
                    {member.xp} XP
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tasks */}
      <SectionHeader
        title={t("tasksTitle")}
        action={
          <button
            onClick={() => { haptic.impact("light"); fetchTasks(); }}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingTasks ? "animate-spin" : ""}`} />
          </button>
        }
      />

      {loadingTasks ? (
        <Card className="flex items-center justify-center py-8">
          <RefreshCw className="w-5 h-5 text-neutral-600 animate-spin" />
        </Card>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-8">
          <PawPrint className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
          <p className="text-neutral-500 text-sm">{t("noTasks")}</p>
          <p className="text-neutral-600 text-xs mt-1">{t("addTaskHint")}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Pending tasks */}
          {pendingTasks.map(task => (
            <Card
              key={task.id}
              onClick={() => toggleTask(task)}
              highlight
              className="flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <button className="shrink-0">
                {task.status === "overdue" ? (
                  <Clock className="w-5 h-5 text-red-500" />
                ) : (
                  <Circle className="w-5 h-5 text-neutral-600" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.status === "overdue" ? "text-red-400" : "text-white"}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.due_date && (
                    <span className="text-neutral-500 text-xs">
                      {new Date(task.due_date).toLocaleDateString("ru-RU")}
                    </span>
                  )}
                  {task.assigned_to && (
                    <span className="text-neutral-600 text-xs">→ {task.assigned_to}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md shrink-0">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 text-xs font-bold">{task.xp_reward}</span>
              </div>
            </Card>
          ))}

          {/* Done tasks */}
          {doneTasks.length > 0 && (
            <>
              <div className="pt-2">
                <p className="text-neutral-600 text-xs uppercase tracking-wider mb-2">
                  {t("completed")} ({doneTasks.length})
                </p>
              </div>
              {doneTasks.slice(0, 5).map(task => (
                <Card
                  key={task.id}
                  onClick={() => toggleTask(task)}
                  className="flex items-center gap-3 opacity-60 active:scale-[0.98] transition-transform"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-neutral-400 text-sm line-through truncate flex-1">{task.title}</p>
                  <div className="flex items-center gap-1 opacity-50">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-400 text-xs">{task.xp_reward}</span>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {/* Activity Feed */}
      <SectionHeader title={t("activityTitle")} />
      <Card>
        <div className="space-y-4">
          {ACTIVITIES.map((activity, i) => (
            <div key={i} className={`flex items-start gap-3 ${i < ACTIVITIES.length - 1 ? "pb-4 border-b border-neutral-800" : ""}`}>
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 shrink-0 mt-0.5">
                {activity.who[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="text-white font-medium">{activity.who}</span>
                  {" "}
                  <span className="text-neutral-400">{activity.what}</span>
                </p>
                <p className="text-neutral-600 text-xs mt-0.5">{activity.when}</p>
              </div>
              <div className="flex items-center gap-0.5 text-amber-400/60">
                <Zap className="w-3 h-3" />
                <span className="text-xs">+{activity.xp}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
