import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL;

  if (
    error ||
    !user ||
    !adminEmail ||
    user.email?.toLowerCase() !== adminEmail.toLowerCase()
  ) {
    return false;
  }

  return true;
}
