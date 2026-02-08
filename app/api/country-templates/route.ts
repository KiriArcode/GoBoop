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

// GET /api/country-templates?country_code=EU
export async function GET(request: NextRequest) {
  const envErr = checkEnv();
  if (envErr) return envErr;

  try {
    const supabase = getSupabaseAdmin();
    const countryCode = request.nextUrl.searchParams.get("country_code");

    let query = supabase.from("country_document_templates").select("*").order("order");

    if (countryCode) {
      query = query.eq("country_code", countryCode);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API country-templates GET]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[API country-templates GET] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
