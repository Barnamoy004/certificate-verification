"use client";

import { useEffect, useState } from "react";

type Student = {
  name: string;
  template: string;
  issue_date: string;
  ambassador_id: string;
  certificate_id: string;
};

const fields = [
  { key: "name", label: "NAME", icon: "♙" },
  { key: "template", label: "TEMPLATE", icon: "▣" },
  { key: "issue_date", label: "DATE", icon: "▦" },
  { key: "ambassador_id", label: "AMBASSADOR GID", icon: "♟" },
  { key: "certificate_id", label: "CERTIFICATE ID", icon: "#" },
] as const;

export default function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    let active = true;

    async function verify() {
      try {
        const { token } = await params;
        const response = await fetch(`/api/verify/${token}`);
        const result = await response.json();

        if (!active) return;

        if (!response.ok || !result.verified) {
          setInvalid(true);
        } else {
          setStudent(result.student);
        }
      } catch {
        if (active) setInvalid(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f1f3f4]">
        <div className="text-center">
          <div className="loader mx-auto mb-4" />
          <p className="text-gray-500">Verifying certificate...</p>
        </div>
        <style jsx>{`
          .loader {
            width: 42px;
            height: 42px;
            border: 4px solid #dce8df;
            border-top-color: #34a853;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </main>
    );
  }

  if (invalid || !student) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f1f3f4] p-5">
        <div className="w-full max-w-xl rounded-[28px] bg-white p-10 text-center shadow-lg animate-card">
          <div className="text-6xl text-red-500">✕</div>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">Certificate Not Found</h1>
          <p className="mt-2 text-gray-500">This certificate could not be verified.</p>
        </div>
        <style jsx>{`
          .animate-card { animation: appear .7s ease both; }
          @keyframes appear {
            from { opacity: 0; transform: translateY(25px) scale(.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </main>
    );
  }

  const formattedDate = new Date(
    student.issue_date + "T00:00:00"
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#f1f3f4] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-[640px]">

        <header className="mb-7 flex items-center gap-3 px-2">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-[#4285F4]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#EA4335]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#FBBC05]" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#34A853]" />
          </div>

          <div className="text-[17px] leading-tight sm:text-xl">
            <span className="font-bold text-[#202124]">
              Google Student Ambassador
            </span>
            <span className="text-[#777b80]"> · Certificate Registry</span>
          </div>
        </header>

        <section className="certificate-card rounded-[30px] border border-[#dadce0] bg-white px-6 py-12 shadow-[0_5px_18px_rgba(60,64,67,0.20)] sm:px-12 sm:py-16">

          <div className="text-center">
            <div className="success-circle mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#e6f4ea]">
              <svg viewBox="0 0 56 56" className="h-14 w-14">
                <circle
                  cx="28"
                  cy="28"
                  r="21"
                  fill="none"
                  stroke="#34A853"
                  strokeWidth="4"
                />
                <path
                  d="M17 28 L25 36 L40 20"
                  fill="none"
                  stroke="#34A853"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="check-draw"
                />
              </svg>
            </div>

            <h1 className="verified-title mt-8 text-[27px] font-bold text-[#4ba568] sm:text-[30px]">
              Certificate verified
            </h1>

            <p className="verified-subtitle mt-1 text-base text-[#666b70] sm:text-xl">
              This entry matches an active record.
            </p>
          </div>

          <div className="mt-9">
            {fields.map((field, index) => {
              const value =
                field.key === "issue_date"
                  ? formattedDate
                  : student[field.key];

              return (
                <div
                  key={field.key}
                  className="detail-row flex items-center gap-4 border-t border-[#dadce0] py-4"
                  style={{ animationDelay: `${0.55 + index * 0.12}s` }}
                >
                  <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-[#e8f0fe] text-[27px] font-semibold text-[#4285f4]">
                    {field.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] tracking-wide text-[#80868b]">
                      {field.label}
                    </p>
                    <p className={`break-words text-[17px] font-semibold leading-snug sm:text-[20px] ${field.key === "ambassador_id" || field.key === "certificate_id" ? "text-[#80868b]" : "text-[#202124]"}`}>
                      {value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-8 text-center">
          <p className="flex items-center justify-center gap-2 text-[15px] text-[#80868b]">
            <span>♢</span> Secured verification · GSA
          </p>
          <p className="mt-4 text-xs text-[#9aa0a6]">
            Independent certificate verification portal
          </p>
        </footer>
      </div>

      <style jsx>{`
        .certificate-card {
          animation: cardPopup .85s cubic-bezier(.2,.8,.2,1) both;
        }

        .success-circle {
          animation: circlePop .7s .35s cubic-bezier(.18,1.4,.4,1) both;
          transform: scale(0);
        }

        .check-draw {
          stroke-dasharray: 36;
          stroke-dashoffset: 36;
          animation: drawCheck .65s 1s ease forwards;
        }

        .verified-title {
          opacity: 0;
          animation: fadeUp .55s 1.05s ease forwards;
        }

        .verified-subtitle {
          opacity: 0;
          animation: fadeUp .55s 1.2s ease forwards;
        }

        .detail-row {
          opacity: 0;
          animation: fadeUp .5s ease forwards;
        }

        @keyframes cardPopup {
          from { opacity: 0; transform: translateY(35px) scale(.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes circlePop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .certificate-card,
          .success-circle,
          .verified-title,
          .verified-subtitle,
          .detail-row,
          .check-draw {
            animation: none;
            opacity: 1;
            transform: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </main>
  );
}

