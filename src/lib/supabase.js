import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wtrmoondicddmcaxsbfo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-wTvng_WAPLeJoI_JFh2iw_8Hg0syjI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function saveState(user, key, value) {
  await supabase.from("trip_state").upsert(
    { username: user, key, value: JSON.stringify(value) },
    { onConflict: "username,key" }
  );
}

export async function loadState(user, key) {
  const { data } = await supabase
    .from("trip_state")
    .select("value")
    .eq("username", user)
    .eq("key", key)
    .maybeSingle();
  return data ? JSON.parse(data.value) : null;
}
