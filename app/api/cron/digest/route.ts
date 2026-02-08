import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const PET_ID = "003ab934-9f93-4f2b-aade-10a6fbc8ca40";

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");
  return token;
}

async function sendMessage(chatId: number, text: string) {
  const token = getBotToken();
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
  if (!res.ok) {
    console.error("[digest sendMessage] error:", await res.text());
  }
}

async function buildDigest(): Promise<string> {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split("T")[0];
  const todayStart = `${today}T00:00:00.000Z`;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Today's data
  const [
    { data: todayNotes },
    { data: todayWeight },
    { data: todayShopping },
    { data: todayTasks },
    { data: todayEvents },
    { data: pendingTasks },
    { data: tomorrowEvents },
    { data: pendingShopping },
  ] = await Promise.all([
    supabase.from("notes").select("*").eq("pet_id", PET_ID).gte("created_at", todayStart),
    supabase.from("weight_records").select("*").eq("pet_id", PET_ID).gte("recorded_at", todayStart),
    supabase.from("shopping_items").select("*").eq("pet_id", PET_ID).gte("created_at", todayStart),
    supabase.from("tasks").select("*").eq("pet_id", PET_ID).eq("status", "done").gte("completed_at", todayStart),
    supabase.from("events").select("*").eq("pet_id", PET_ID).eq("date", today),
    supabase.from("tasks").select("*").eq("pet_id", PET_ID).eq("status", "pending"),
    supabase.from("events").select("*").eq("pet_id", PET_ID).eq("date", tomorrow),
    supabase.from("shopping_items").select("*").eq("pet_id", PET_ID).eq("status", "pending"),
  ]);

  const lines: string[] = [];
  lines.push("🐾 <b>GoBoop — Сводка дня</b>");
  lines.push("");

  // Today's summary
  const stats: string[] = [];
  if (todayEvents?.length) stats.push(`📅 События: ${todayEvents.length}`);
  if (todayTasks?.length) stats.push(`✅ Задач выполнено: ${todayTasks.length}`);
  if (todayNotes?.length) stats.push(`📝 Заметок: ${todayNotes.length}`);
  if (todayShopping?.length) stats.push(`🛒 Покупок добавлено: ${todayShopping.length}`);

  if (todayWeight?.length) {
    const latest = todayWeight[todayWeight.length - 1];
    stats.push(`⚖️ Вес: ${latest.weight_kg} кг`);
  }

  if (stats.length > 0) {
    lines.push("<b>Сегодня:</b>");
    lines.push(...stats);
  } else {
    lines.push("Сегодня записей не было 📭");
  }

  // Tomorrow's events
  if (tomorrowEvents?.length) {
    lines.push("");
    lines.push("<b>Завтра:</b>");
    tomorrowEvents.forEach((e) => {
      const emoji = e.type === "vet" ? "🏥" : e.type === "trip" ? "✈️" : "📅";
      lines.push(`${emoji} ${e.title}${e.time ? ` в ${e.time}` : ""}${e.location ? ` (${e.location})` : ""}`);
    });
  }

  // Pending tasks
  if (pendingTasks?.length) {
    lines.push("");
    lines.push(`<b>Незакрытые задачи (${pendingTasks.length}):</b>`);
    pendingTasks.slice(0, 5).forEach((t) => {
      lines.push(`• ${t.title}${t.due_date ? ` (до ${new Date(t.due_date).toLocaleDateString("ru-RU")})` : ""}`);
    });
    if (pendingTasks.length > 5) {
      lines.push(`... и ещё ${pendingTasks.length - 5}`);
    }
  }

  // Shopping list
  if (pendingShopping?.length) {
    lines.push("");
    lines.push(`<b>Нужно купить (${pendingShopping.length}):</b>`);
    pendingShopping.slice(0, 5).forEach((s) => {
      lines.push(`🛒 ${s.title}`);
    });
    if (pendingShopping.length > 5) {
      lines.push(`... и ещё ${pendingShopping.length - 5}`);
    }
  }

  lines.push("");
  lines.push("Хорошего вечера! 🌙");

  return lines.join("\n");
}

// GET /api/cron/digest — called by Vercel Cron
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow if: Vercel cron header matches, or no CRON_SECRET set (dev), or manual trigger with secret param
  const manualSecret = request.nextUrl.searchParams.get("secret");
  const isAuthorized =
    !cronSecret ||
    authHeader === `Bearer ${cronSecret}` ||
    manualSecret === "goboop";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Get all active chats
    const { data: chats, error } = await supabase
      .from("bot_chats")
      .select("chat_id")
      .eq("is_active", true);

    if (error) {
      console.error("[digest] Failed to fetch chats:", error);
      return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
    }

    if (!chats?.length) {
      return NextResponse.json({ status: "no_chats", message: "No active chats to send digest to" });
    }

    const digest = await buildDigest();
    let sent = 0;
    let failed = 0;

    for (const chat of chats) {
      try {
        await sendMessage(chat.chat_id, digest);
        sent++;
      } catch (e) {
        console.error(`[digest] Failed to send to ${chat.chat_id}:`, e);
        failed++;
      }
    }

    return NextResponse.json({
      status: "ok",
      sent,
      failed,
      totalChats: chats.length,
    });
  } catch (error) {
    console.error("[digest] Error:", error);
    return NextResponse.json({ error: "Digest failed" }, { status: 500 });
  }
}
