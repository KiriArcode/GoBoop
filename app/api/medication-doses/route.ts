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

// GET /api/medication-doses?medication_id=xxx
export async function GET(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const supabase = getSupabaseAdmin();
    const medicationId = request.nextUrl.searchParams.get("medication_id");

    if (!medicationId) {
      return NextResponse.json({ error: "medication_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("medication_doses")
      .select("*")
      .eq("medication_id", medicationId)
      .order("scheduled_at", { ascending: true });

    if (error) {
      console.error("[API medication-doses GET]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API medication-doses GET] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/medication-doses — mark dose as taken, or create scheduled dose
export async function POST(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const body = await request.json();

    // If marking as taken: { dose_id, taken_by }
    if (body.dose_id && body.taken_by !== undefined) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("medication_doses")
        .update({
          taken_at: new Date().toISOString(),
          taken_by: body.taken_by || null,
        })
        .eq("id", body.dose_id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    // If logging "taken": { medication_id, taken_by }
    if (body.medication_id && body.taken_by !== undefined) {
      const now = new Date().toISOString();
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("medication_doses")
        .insert({
          medication_id: body.medication_id,
          scheduled_at: now,
          taken_at: now,
          taken_by: body.taken_by || null,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data, { status: 201 });
    }

    // Create new dose record
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("medication_doses")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("[API medication-doses POST]", error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API medication-doses POST] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
