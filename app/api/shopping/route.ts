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

// GET /api/shopping?pet_id=xxx&status=pending
export async function GET(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const petId = request.nextUrl.searchParams.get("pet_id");
    const status = request.nextUrl.searchParams.get("status");

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("shopping_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (petId) query = query.eq("pet_id", petId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;

    if (error) {
      console.error("[API shopping GET]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API shopping GET] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/shopping
export async function POST(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const body = await request.json();

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("shopping_items")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("[API shopping POST]", error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API shopping POST] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/shopping
export async function DELETE(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("shopping_items").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/shopping (mark as bought)
export async function PATCH(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("shopping_items")
      .update({ ...updates, bought_at: updates.status === "bought" ? new Date().toISOString() : null })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[API shopping PATCH]", error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API shopping PATCH] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
