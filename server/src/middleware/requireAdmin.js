import supabase from "../lib/supabase.js";

export default async function requireAdmin(userId) {
  const { data } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  return data?.is_admin === true;
}
