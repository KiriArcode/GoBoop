import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are GoBoop AI assistant for a pet care app. 
Parse the user's text command and return a JSON object with:
- "type": one of "vet", "trip", "weight", "shopping", "note", "task", "reminder"
- "confidence": number 0-1 how confident you are
- "data": extracted structured data as key-value pairs

Examples:
- "Купили корм Royal Canin 3кг за 2500" → {"type":"shopping","confidence":0.95,"data":{"title":"Корм Royal Canin 3кг","price":2500}}
- "Арчи весит 12.5 кг" → {"type":"weight","confidence":0.98,"data":{"weight_kg":12.5}}
- "Завтра к ветеринару в 15:00" → {"type":"vet","confidence":0.9,"data":{"title":"Визит к ветеринару","date":"tomorrow","time":"15:00"}}
- "Купить новый поводок" → {"type":"shopping","confidence":0.85,"data":{"title":"Новый поводок"}}
- "Дать таблетку от глистов" → {"type":"task","confidence":0.9,"data":{"title":"Дать таблетку от глистов"}}
- "Напомни завтра в 10:00 про прививку" → {"type":"reminder","confidence":0.9,"data":{"content":"Прививка","remind_at":"tomorrow 10:00"}}
- "Гуляли 30 минут в парке" → {"type":"note","confidence":0.8,"data":{"content":"Гуляли 30 минут в парке"}}

If in doubt, use "note" as the type and put the full text in data.content.
NEVER return "unknown" as type — always pick the best matching type.
Return ONLY valid JSON, no markdown, no explanations, no code fences.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured", type: "note", confidence: 0, data: {} },
        { status: 500 }
      );
    }

    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text field is required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `Parse this command: "${text}"` },
          ],
        },
      ],
    });

    const response = result.response.text();

    // Clean up response — remove markdown code blocks if present
    const cleaned = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("[AI Parse Error]", errMsg);
    return NextResponse.json(
      { error: errMsg, type: "note", confidence: 0, data: {} },
      { status: 500 }
    );
  }
}
