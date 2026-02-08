import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/telegram/setup?action=set&secret=goboop — register webhook
 * GET /api/telegram/setup?action=info&secret=goboop — get current webhook info
 * GET /api/telegram/setup?action=delete&secret=goboop — remove webhook
 *
 * Protected by a simple password "goboop" (or TELEGRAM_WEBHOOK_SECRET env var)
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "goboop";

  if (!secret || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({
      error: "Forbidden",
      hint: "Add ?secret=goboop to URL",
      bot_token_set: !!process.env.TELEGRAM_BOT_TOKEN,
    }, { status: 403 });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set in Vercel Environment Variables" }, { status: 500 });
  }

  const action = request.nextUrl.searchParams.get("action") || "info";

  // Build the webhook URL
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "https://go-boop.vercel.app";

  const webhookUrl = `${host}/api/telegram/webhook?token=${BOT_TOKEN}`;

  try {
    switch (action) {
      case "set": {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ["message"],
            drop_pending_updates: true,
          }),
        });
        const data = await res.json();
        return NextResponse.json({ action: "set", webhookUrl: webhookUrl.replace(BOT_TOKEN, "***"), result: data });
      }

      case "delete": {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ drop_pending_updates: true }),
        });
        const data = await res.json();
        return NextResponse.json({ action: "delete", result: data });
      }

      case "info":
      default: {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
        const data = await res.json();
        return NextResponse.json({ action: "info", result: data });
      }
    }
  } catch (error) {
    console.error("[Telegram Setup Error]", error);
    return NextResponse.json({ error: "Failed to communicate with Telegram API" }, { status: 500 });
  }
}
