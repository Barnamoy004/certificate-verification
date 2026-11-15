import { Suspense } from "react";
import { connection } from "next/server";
import { supabase } from "@/lib/supabase";

async function ConnectionStatus() {
  // Run the check at request time so it reflects the live database state.
  await connection();

  const { error } = await supabase.from("students").select("id").limit(1);

  return (
    <p className={error ? "mt-4 text-red-600" : "mt-4 text-green-600"}>
      {error ? `Connection Error: ${error.message}` : "Database Connected Successfully!"}
    </p>
  );
}

export default function TestDatabase() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold">Database Connection Test</h1>
        <Suspense fallback={<p className="mt-4 text-gray-500">Checking connection...</p>}>
          <ConnectionStatus />
        </Suspense>
      </div>
    </main>
  );
}
