import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function checkEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase environment variables not configured" },
      { status: 500 }
    );
  }
  return null;
}

// GET /api/trip-documents?event_id=xxx
export async function GET(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const supabase = getSupabaseAdmin();
    const eventId = request.nextUrl.searchParams.get("event_id");

    if (!eventId) {
      return NextResponse.json({ error: "event_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("trip_documents")
      .select("*")
      .eq("event_id", eventId)
      .order("order");

    if (error) {
      console.error("[API trip-documents GET]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API trip-documents GET] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/trip-documents
export async function POST(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("trip_documents")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("[API trip-documents POST]", error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API trip-documents POST] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/trip-documents
export async function PATCH(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("trip_documents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/trip-documents
export async function DELETE(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("trip_documents").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
