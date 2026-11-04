"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function SignInWithGoogle() {
  const [pending, setPending] = useState(false);

  const signIn = async () => {
    setPending(true);
    const { error } = await createBrowserSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setPending(false);
  };

  return (
    <Button size="lg" onClick={signIn} disabled={pending}>
      {pending ? "กำลังไปที่ Google…" : "เข้าสู่ระบบด้วย Google"}
    </Button>
  );
}
