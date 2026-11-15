import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const students = body.students;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: "No student records found." },
        { status: 400 }
      );
    }

    if (students.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 students can be uploaded at once." },
        { status: 400 }
      );
    }

    const requiredFields = [
      "name",
      "template",
      "theme",
      "issue_date",
      "ambassador_id",
      "certificate_id"
    ];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      for (const field of requiredFields) {
        if (
          typeof student[field] !== "string" ||
          !student[field].trim()
        ) {
          return NextResponse.json(
            { error: `Row ${i + 2}: Missing or invalid ${field}.` },
            { status: 400 }
          );
        }
      }
    }

    const certificateIds = students.map(
      (student: { certificate_id: string }) =>
        student.certificate_id.trim()
    );

    if (new Set(certificateIds).size !== certificateIds.length) {
      return NextResponse.json(
        { error: "Duplicate Certificate IDs found in the uploaded file." },
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

    const records = students.map((student: {
      name: string;
      template: string;
      theme: string;
      issue_date: string;
      ambassador_id: string;
      certificate_id: string;
    }) => ({
      name: student.name.trim(),
      template: student.template.trim(),
      theme: student.theme.trim(),
      issue_date: student.issue_date.trim(),
      ambassador_id: student.ambassador_id.trim(),
      certificate_id: student.certificate_id.trim()
    }));

    const { data, error } = await supabase
      .from("students")
      .insert(records)
      .select("name, certificate_id, verification_token");

    if (error) {
      return NextResponse.json(
        {
          error: error.code === "23505"
            ? "One or more Certificate IDs already exist in the database."
            : "Bulk upload failed. Please check your CSV data."
        },
        { status: error.code === "23505" ? 409 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      students: data
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400 }
    );
  }
}
