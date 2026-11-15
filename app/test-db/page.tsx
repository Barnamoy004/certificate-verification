import { supabase } from "@/lib/supabase";

export default async function TestDatabase() {
  const { data, error } = await supabase
    .from("students")
    .select("id")
    .limit(1);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold">Database Connection Test</h1>
        <p className={error ? "mt-4 text-red-600" : "mt-4 text-green-600"}>
          {error ? `Connection Error: ${error.message}` : "Database Connected Successfully!"}
        </p>
      </div>
    </main>
  );
}
