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

// GET /api/treatment-steps?treatment_case_id=xxx
export async function GET(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const supabase = getSupabaseAdmin();
    const caseId = request.nextUrl.searchParams.get("treatment_case_id");

    if (!caseId) {
      return NextResponse.json({ error: "treatment_case_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("treatment_steps")
      .select("*")
      .eq("treatment_case_id", caseId)
      .order("order");

    if (error) {
      console.error("[API treatment-steps GET]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API treatment-steps GET] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/treatment-steps
export async function POST(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("treatment_steps")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("[API treatment-steps POST]", error.message, error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API treatment-steps POST] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/treatment-steps (for marking done)
export async function PATCH(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("treatment_steps")
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

// DELETE /api/treatment-steps
export async function DELETE(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("treatment_steps").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
