"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Papa from "papaparse";
import JSZip from "jszip";

type Student = {
  name: string;
  template: string;
  theme: string;
  issue_date: string;
  ambassador_id: string;
  certificate_id: string;
};

export default function AdminPage() {
  const [form, setForm] = useState({
    name: "",
    template: "Certificate of Participation",
    theme: "Game On : Image the Impossible",
    issue_date: "",
    ambassador_id: "GID-15096",
    certificate_id: ""
  });

  const [qr, setQr] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [generatedCertificateId, setGeneratedCertificateId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");

  useEffect(() => {
    const today = new Date();
    const localDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");

    setForm((old) => ({ ...old, issue_date: localDate }));
  }, []);

  function update(field: string, value: string) {
    setForm((old) => ({ ...old, [field]: value }));
  }

  async function createStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setQr("");
    setVerificationUrl("");
    setGeneratedCertificateId("");
    setMessage("");

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Student creation failed");
      }

      const url = `${window.location.origin}/verify/${result.student.verification_token}`;
      const qrImage = await QRCode.toDataURL(url, {
        width: 500,
        margin: 3,
        errorCorrectionLevel: "H"
      });

      setQr(qrImage);
      setVerificationUrl(url);
      setGeneratedCertificateId(form.certificate_id);
      setMessage("Student added and QR Code generated successfully!");

      setForm((old) => ({
        ...old,
        name: "",
        certificate_id: ""
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function uploadCSV() {
    if (!csvFile) {
      setBulkMessage("Please select a CSV file first.");
      return;
    }

    setBulkLoading(true);
    setBulkMessage("");

    try {
      const parsed = await new Promise<Student[]>((resolve, reject) => {
        Papa.parse<Student>(csvFile, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error(results.errors[0].message));
              return;
            }
            resolve(results.data);
          },
          error: (error) => reject(error)
        });
      });

      const requiredHeaders = [
        "name",
        "template",
        "theme",
        "issue_date",
        "ambassador_id",
        "certificate_id"
      ];

      const headers = Object.keys(parsed[0] || {});
      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        throw new Error("Missing CSV columns: " + missingHeaders.join(", "));
      }

      if (parsed.length === 0 || parsed.length > 100) {
        throw new Error("CSV must contain between 1 and 100 students.");
      }

      const students = parsed.map((student) => ({
        name: student.name?.trim(),
        template: student.template?.trim(),
        theme: student.theme?.trim(),
        issue_date: student.issue_date?.trim(),
        ambassador_id: student.ambassador_id?.trim(),
        certificate_id: student.certificate_id?.trim()
      }));

      const response = await fetch("/api/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Bulk upload failed.");
      }

      const zip = new JSZip();

      for (const student of result.students) {
        const url = `${window.location.origin}/verify/${student.verification_token}`;

        const qrData = await QRCode.toDataURL(url, {
          width: 500,
          margin: 3,
          errorCorrectionLevel: "H"
        });

        const base64 = qrData.split(",")[1];
        const safeName = student.name.trim().replace(/[^a-zA-Z0-9_-]/g, "_");

        zip.file(`${safeName}.png`, base64, { base64: true });
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = "GSA-Student-QR-Codes.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      setBulkMessage(
        `Success! ${result.count} students added and their QR codes downloaded as a ZIP file.`
      );
      setCsvFile(null);

      const fileInput = document.getElementById("csv-upload") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setBulkMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Certificate Management System
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage student certificates and generate unique verification QR codes.
          </p>
        </header>

        <section className="mb-8 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Bulk Student Upload
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Upload your CSV file to add students and generate all QR codes together.
          </p>

          <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <div className="text-3xl">📄</div>
            <label
              htmlFor="csv-upload"
              className="mt-3 inline-block cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Choose CSV File
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            />
            <p className="mt-3 break-all text-sm text-slate-600">
              {csvFile ? csvFile.name : "No file selected"}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Maximum 100 students per upload. Required columns: name, template, theme, issue_date, ambassador_id, certificate_id.
            </p>
          </div>

          <button
            type="button"
            onClick={uploadCSV}
            disabled={bulkLoading || !csvFile}
            className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bulkLoading ? "Uploading & Generating QR Codes..." : "Upload Students & Download All QR Codes"}
          </button>

          {bulkMessage && (
            <p className="mt-4 break-words rounded-xl bg-blue-50 p-4 text-sm font-medium text-blue-800">
              {bulkMessage}
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Add Single Student
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Add one student and generate an individual QR code.
          </p>

          <form onSubmit={createStudent} className="mt-6 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { key: "name", label: "Student Full Name", placeholder: "Enter student name" },
                { key: "ambassador_id", label: "Ambassador GID", placeholder: "Enter GID" },
                { key: "certificate_id", label: "Certificate ID", placeholder: "Enter unique Certificate ID" },
                { key: "template", label: "Certificate Template", placeholder: "Enter template name" },
                { key: "theme", label: "Monthly Theme", placeholder: "Enter monthly theme" }
              ].map((field) => (
                <div key={field.key} className={field.key === "name" || field.key === "template" || field.key === "theme" ? "sm:col-span-2" : ""}>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {field.label}
                  </label>
                  <input
                    required
                    value={form[field.key as keyof typeof form]}
                    onChange={(e) => update(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              ))}

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Certificate Issue Date
                </label>
                <input
                  type="date"
                  required
                  value={form.issue_date}
                  onChange={(e) => update("issue_date", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.issue_date}
              className="w-full rounded-xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating QR Code..." : "Add Student & Generate QR"}
            </button>

            {message && (
              <p className="break-words rounded-xl bg-blue-50 p-4 text-sm font-medium text-blue-800">
                {message}
              </p>
            )}
          </form>

          {qr && (
            <div className="mt-7 rounded-2xl border border-slate-200 p-6 text-center">
              <h3 className="text-lg font-bold text-slate-900">
                QR Code Generated
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Certificate ID: {generatedCertificateId}
              </p>
              <img
                src={qr}
                alt="Student verification QR code"
                className="mx-auto mt-5 w-64 max-w-full"
              />
              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href={qr}
                  download={`${generatedCertificateId || "student"}-QR.png`}
                  className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700"
                >
                  Download QR Code
                </a>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(verificationUrl)}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Copy Verification Link
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
