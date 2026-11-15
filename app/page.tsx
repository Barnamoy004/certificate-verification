
export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f7fa] flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
          ✓
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Certificate Verified
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          This certificate has been successfully verified.
        </p>

        <div className="mt-8 space-y-5 text-left">
          {[
            ["Name", "Student Full Name"],
            ["Template", "Certificate of Participation"],
            ["Date", "13 November 2026"],
            ["Ambassador ID", "GID-15096"],
            ["Certificate ID", "CERT-2026-0001"],
          ].map(([label, value]) => (
            <div key={label} className="border-b border-gray-100 pb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {label}
              </p>
              <p className="mt-1 font-medium text-gray-800">{value}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Secure Certificate Verification Portal
        </p>
      </div>
    </main>
  );
}
