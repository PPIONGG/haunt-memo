import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Returns a Supabase client acting as the signed-in Curator, or redirects away.
 * RLS is the real gate; this only keeps non-Curators out of the admin UI.
 */
export const requireCurator = cache(async () => {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/sign-in");

  const { data: isCurator } = await supabase.rpc("is_curator");
  if (!isCurator) redirect("/auth/sign-out?error=not_authorised");

  return { supabase, user };
});
