import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const PET_ID = "003ab934-9f93-4f2b-aade-10a6fbc8ca40";

// GET /api/photos?pet_id=xxx — list photos
export async function GET(request: NextRequest) {
  try {
    const petId = request.nextUrl.searchParams.get("pet_id") || PET_ID;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("pet_id", petId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/photos — upload photo via FormData
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || "";
    const createdBy = (formData.get("created_by") as string) || "User";
    const petId = (formData.get("pet_id") as string) || PET_ID;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF allowed" }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${petId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("pet-photos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[photos upload]", uploadError);
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("pet-photos")
      .getPublicUrl(fileName);

    // Save to DB
    const { data: photo, error: dbError } = await supabase
      .from("photos")
      .insert({
        pet_id: petId,
        storage_path: fileName,
        url: urlData.publicUrl,
        caption,
        created_by: createdBy,
      })
      .select()
      .single();

    if (dbError) {
      console.error("[photos db]", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(photo, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[photos]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
