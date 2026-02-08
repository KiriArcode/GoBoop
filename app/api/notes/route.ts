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

// GET /api/notes?pet_id=xxx
export async function GET(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const petId = request.nextUrl.searchParams.get("pet_id");

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (petId) query = query.eq("pet_id", petId);

    const { data, error } = await query;

    if (error) {
      console.error("[API notes GET]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API notes GET] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/notes
export async function DELETE(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/notes
export async function PATCH(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;
  try {
    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("notes").update(updates).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/notes
export async function POST(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const body = await request.json();

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("notes")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("[API notes POST]", error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API notes POST] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
