import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET /api/debug — diagnostic endpoint (remove in production)
export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Check env vars presence (don't reveal values!)
  checks["NEXT_PUBLIC_SUPABASE_URL"] = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `set (${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...)`
    : "MISSING";

  checks["SUPABASE_SERVICE_ROLE_KEY"] = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? `set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)`
    : "MISSING";

  checks["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? `set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...)`
    : "MISSING";

  checks["GEMINI_API_KEY"] = process.env.GEMINI_API_KEY
    ? `set (${process.env.GEMINI_API_KEY.substring(0, 15)}...)`
    : "MISSING";

  // 2. Test Supabase connection
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("pets").select("id, name").limit(1);

    if (error) {
      checks["supabase_connection"] = `ERROR: ${error.message}`;
    } else {
      checks["supabase_connection"] = `OK — found ${data?.length ?? 0} pets`;
      if (data && data.length > 0) {
        checks["first_pet"] = JSON.stringify(data[0]);
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    checks["supabase_connection"] = `CRASH: ${msg}`;
  }

  // 3. Test insert + delete (events table)
  try {
    const supabase = getSupabaseAdmin();
    const testBody = {
      pet_id: "003ab934-9f93-4f2b-aade-10a6fbc8ca40",
      type: "other",
      title: "Debug test event",
      date: new Date().toISOString().split("T")[0],
      created_by: "debug",
    };
    const { data, error } = await supabase.from("events").insert(testBody).select().single();

    if (error) {
      checks["supabase_insert"] = `ERROR: ${error.message} | details: ${error.details} | hint: ${error.hint}`;
    } else {
      checks["supabase_insert"] = `OK — inserted event id: ${data.id}`;
      // Clean up
      await supabase.from("events").delete().eq("id", data.id);
      checks["supabase_cleanup"] = "OK — deleted test event";
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    checks["supabase_insert"] = `CRASH: ${msg}`;
  }

  return NextResponse.json(checks, { status: 200 });
}
