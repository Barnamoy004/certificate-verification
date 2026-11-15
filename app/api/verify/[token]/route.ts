import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("students")
      .select("name, template, issue_date, ambassador_id, certificate_id, is_verified")
      .eq("verification_token", token)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }

    if (!data || !data.is_verified) {
      return NextResponse.json({ error: "Certificate not found or invalid" }, { status: 404 });
    }

    return NextResponse.json({ verified: true, student: data });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
