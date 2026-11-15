
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      template,
      theme,
      issue_date,
      ambassador_id,
      certificate_id
    } = body;

    if (
      !name?.trim() ||
      !template?.trim() ||
      !theme?.trim() ||
      !issue_date ||
      !ambassador_id?.trim() ||
      !certificate_id?.trim()
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("students")
      .insert({
        name: name.trim(),
        template: template.trim(),
        theme: theme.trim(),
        issue_date,
        ambassador_id: ambassador_id.trim(),
        certificate_id: certificate_id.trim()
      })
      .select("id, verification_token")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This Certificate ID already exists." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Could not save student. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      student: data
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
