import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useDebouncedSave(user, key, value, synced, delay = 1500) {
  const [saving, setSaving] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!user || !synced) return;
    setSaving(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await supabase.from("trip_state").upsert(
        { username: user, key, value: JSON.stringify(value) },
        { onConflict: "username,key" }
      );
      setSaving(false);
    }, delay);
    return () => clearTimeout(timer.current);
  }, [user, key, JSON.stringify(value), synced]);

  return { saving };
}
