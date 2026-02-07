import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/shopping?pet_id=xxx&status=pending
export async function GET(request: NextRequest) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/shopping
export async function POST(request: NextRequest) {
  const body = await request.json();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("shopping_items")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/shopping (mark as bought)
export async function PATCH(request: NextRequest) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
