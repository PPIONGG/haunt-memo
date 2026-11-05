import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type LocalStatus = { API_URL: string; ANON_KEY: string; SERVICE_ROLE_KEY: string };

let status: LocalStatus | null = null;

function localStatus(): LocalStatus {
  status ??= JSON.parse(execSync("pnpm --silent supabase status -o json", { encoding: "utf8" }));
  return status!;
}

const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } };

export function anonClient(): SupabaseClient {
  const { API_URL, ANON_KEY } = localStatus();
  return createClient(API_URL, ANON_KEY, clientOptions);
}

export function serviceClient(): SupabaseClient {
  const { API_URL, SERVICE_ROLE_KEY } = localStatus();
  return createClient(API_URL, SERVICE_ROLE_KEY, clientOptions);
}

/** Creates a confirmed password user with the given email, as the dashboard would, and returns a client signed in as them. */
export async function signedInClient(email: string): Promise<SupabaseClient> {
  const password = `pw-${randomUUID()}`;
  const admin = serviceClient();
  const { data: existing } = await admin.auth.admin.listUsers();
  const previous = existing.users.find((u) => u.email === email);
  if (previous) {
    const { error } = await admin.auth.admin.deleteUser(previous.id);
    if (error) throw error;
  }
  const { error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (createError) throw createError;
  const client = anonClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

export async function allowCurator(email: string): Promise<void> {
  const { error } = await serviceClient().from("curator_allowlist").upsert({ email });
  if (error) throw error;
}

export async function resetArchive(): Promise<void> {
  const db = serviceClient();
  for (const table of ["stories", "tags", "storytellers"]) {
    const { error } = await db.from(table).delete().not("id", "is", null);
    if (error) throw error;
  }
}
