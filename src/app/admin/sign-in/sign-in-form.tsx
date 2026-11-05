"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithPassword, type SignInState } from "./actions";

const INITIAL: SignInState = { error: null, email: "" };

export function SignInForm() {
  const [state, action, pending] = useActionState(signInWithPassword, INITIAL);

  return (
    <form action={action} className="grid gap-4 text-left">
      <div className="grid gap-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </Button>
    </form>
  );
}
