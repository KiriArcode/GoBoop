import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Telegram Bot API types (subset)
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: {
    id: number;
    type: "private" | "group" | "supergroup" | "channel";
    title?: string;
  };
  date: number;
  text?: string;
  photo?: Array<{ file_id: string; file_unique_id: string; width: number; height: number }>;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

const PET_ID = "003ab934-9f93-4f2b-aade-10a6fbc8ca40"; // Demo pet, will be dynamic later

// Lazy getter — always reads env at runtime
function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");
  return token;
}

async function sendMessage(chatId: number, text: string, replyToMessageId?: number) {
  try {
    const token = getBotToken();
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_to_message_id: replyToMessageId,
        parse_mode: "HTML",
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[sendMessage] Telegram API error:", res.status, err);
    }
  } catch (e) {
    console.error("[sendMessage] Error:", e);
  }
}

async function parseWithAI(text: string): Promise<{ type: string; confidence: number; data: Record<string, unknown> } | null> {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[parseWithAI] GEMINI_API_KEY not set");
      return null;
    }

    const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];
    const genAI = new GoogleGenerativeAI(apiKey);

    const SYSTEM_PROMPT = `You are GoBoop AI for a pet care app. Parse the command and return JSON:
- "type": one of "vet", "trip", "weight", "shopping", "note", "task", "reminder"
- "confidence": 0-1
- "data": extracted data

Examples:
- "Купили корм 3кг за 2500" → {"type":"shopping","confidence":0.95,"data":{"title":"Корм 3кг","price":2500}}
- "Весит 12.5 кг" → {"type":"weight","confidence":0.98,"data":{"weight_kg":12.5}}
- "Завтра к ветеринару 15:00" → {"type":"vet","confidence":0.9,"data":{"title":"Ветеринар","date":"tomorrow","time":"15:00"}}
- "Купить поводок" → {"type":"shopping","confidence":0.85,"data":{"title":"Поводок"}}
- "Дать таблетку" → {"type":"task","confidence":0.9,"data":{"title":"Дать таблетку"}}

If in doubt use "note". NEVER return "unknown". Return ONLY valid JSON.`;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }, { text: `Parse: "${text}"` }] }],
        });
        const response = result.response.text();
        const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        console.log(`[parseWithAI] Model ${modelName} OK:`, cleaned);
        return JSON.parse(cleaned);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        console.error(`[parseWithAI] Model ${modelName} failed:`, msg);
        if (msg.includes("429") || msg.includes("quota")) continue;
        break;
      }
    }
  } catch (e) {
    console.error("[parseWithAI] Error:", e);
  }
  return null;
}

async function saveToSupabase(type: string, data: Record<string, unknown>, userName: string) {
  const supabase = getSupabaseAdmin();
  const base = { pet_id: PET_ID, created_by: userName };

  switch (type) {
    case "shopping":
      return supabase.from("shopping_items").insert({ ...base, title: data.title || "Покупка", price: data.price || null }).select().single();
    case "weight":
      return supabase.from("weight_records").insert({ ...base, weight_kg: data.weight_kg || 0 }).select().single();
    case "task":
      return supabase.from("tasks").insert({ ...base, title: data.title || "Задача", status: "pending", xp_reward: 10 }).select().single();
    case "vet":
      return supabase.from("events").insert({ ...base, type: "vet", title: data.title || "Визит к врачу", date: data.date || new Date().toISOString().split("T")[0] }).select().single();
    case "trip":
      return supabase.from("events").insert({ ...base, type: "trip", title: data.title || "Поездка", date: data.date || new Date().toISOString().split("T")[0] }).select().single();
    case "note":
    case "reminder":
    default:
      return supabase.from("notes").insert({ ...base, content: data.content || data.title || "Заметка" }).select().single();
  }
}

function getTypeEmoji(type: string): string {
  const map: Record<string, string> = {
    shopping: "🛒",
    weight: "⚖️",
    task: "✅",
    vet: "🏥",
    trip: "✈️",
    note: "📝",
    reminder: "🔔",
  };
  return map[type] || "📌";
}

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    shopping: "Покупка",
    weight: "Вес",
    task: "Задача",
    vet: "Визит к врачу",
    trip: "Поездка",
    note: "Заметка",
    reminder: "Напоминание",
  };
  return map[type] || "Запись";
}

// Handle /start command
async function handleStart(chatId: number) {
  const text = `🐾 <b>GoBoop Bot</b>

Я помогаю следить за вашим питомцем!

<b>Что я умею:</b>
• Записывать данные из текстовых сообщений
• Понимать команды вроде "Купили корм 2кг" или "Вес 12.5 кг"

<b>Просто напишите в чат:</b>
"Купили корм Royal Canin"
"Завтра к ветеринару в 15:00"
"Вес 11.8 кг"
"Дать таблетку от глистов"

Или откройте <b>Mini App</b> через кнопку меню для полного интерфейса.`;

  await sendMessage(chatId, text);
}

// POST /api/telegram/webhook
export async function POST(request: NextRequest) {
  try {
    // Verify bot token in URL for basic security
    const urlToken = request.nextUrl.searchParams.get("token");
    let botToken: string;
    try {
      botToken = getBotToken();
    } catch {
      console.error("[webhook] TELEGRAM_BOT_TOKEN not available");
      return NextResponse.json({ ok: true }); // Don't expose error to Telegram
    }

    if (urlToken !== botToken) {
      console.error("[webhook] Token mismatch. URL token length:", urlToken?.length, "Env token length:", botToken.length);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update: TelegramUpdate = await request.json();
    console.log("[webhook] Received update:", update.update_id, "chat:", update.message?.chat.id, "text:", update.message?.text?.substring(0, 50));

    const message = update.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const userName = message.from?.first_name || "User";

    // Handle /start command
    if (text === "/start") {
      await handleStart(chatId);
      return NextResponse.json({ ok: true });
    }

    // In group chats, only respond to messages that mention the bot or reply to it
    if (message.chat.type === "group" || message.chat.type === "supergroup") {
      const botMentioned = text.includes("@") || text.toLowerCase().includes("goboop");
      if (!botMentioned) {
        return NextResponse.json({ ok: true }); // Ignore non-mentioned messages in groups
      }
    }

    // Ignore other slash commands
    if (text.startsWith("/")) {
      return NextResponse.json({ ok: true });
    }

    // Try to parse with AI
    const parsed = await parseWithAI(text);

    if (parsed && parsed.type) {
      const result = await saveToSupabase(parsed.type, parsed.data, userName);

      if (result.error) {
        console.error("[webhook] Supabase save error:", result.error);
        await sendMessage(
          chatId,
          `❌ Ошибка сохранения: ${result.error.message}`,
          message.message_id
        );
      } else {
        const emoji = getTypeEmoji(parsed.type);
        const label = getTypeLabel(parsed.type);
        const details = Object.entries(parsed.data)
          .map(([k, v]) => `• ${k}: ${v}`)
          .join("\n");

        await sendMessage(
          chatId,
          `${emoji} <b>${label}</b> сохранена!\n\n${details}`,
          message.message_id
        );
      }
    } else {
      // AI unavailable — save as note
      const supabase = getSupabaseAdmin();
      const { data: noteData, error } = await supabase.from("notes").insert({
        pet_id: PET_ID,
        content: text,
        created_by: userName,
      }).select().single();

      if (error) {
        console.error("[webhook] Note save error:", error.message, error.details, error.hint);
        await sendMessage(
          chatId,
          `❌ Не удалось сохранить заметку: ${error.message}`,
          message.message_id
        );
      } else {
        console.log("[webhook] Note saved:", noteData?.id);
        await sendMessage(
          chatId,
          `📝 Сохранено как заметка (AI временно недоступен)`,
          message.message_id
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook Error]", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// GET — health check + diagnostics
export async function GET() {
  const hasToken = !!process.env.TELEGRAM_BOT_TOKEN;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  return NextResponse.json({
    status: "ok",
    bot: "GoBoop",
    env: { hasToken, hasGemini, hasSupabase },
  });
}
