import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/notes?pet_id=xxx
export async function GET(request: NextRequest) {
  const petId = request.nextUrl.searchParams.get("pet_id");

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (petId) query = query.eq("pet_id", petId);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/notes
export async function POST(request: NextRequest) {
  const body = await request.json();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("notes")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
