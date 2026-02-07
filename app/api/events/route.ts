import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/events?pet_id=xxx
export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const petId = request.nextUrl.searchParams.get("pet_id");

  let query = supabase.from("events").select("*").order("date", { ascending: true });

  if (petId) {
    query = query.eq("pet_id", petId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/events
export async function POST(request: NextRequest) {
  const body = await request.json();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("events").insert(body).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
