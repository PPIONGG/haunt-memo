import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient } from "@/lib/supabase/server";

async function signOut(request: NextRequest) {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  const target = new URL("/admin/sign-in", request.url);
  if (request.nextUrl.searchParams.get("error") === "not_authorised") {
    target.searchParams.set("error", "not_authorised");
  }
  return NextResponse.redirect(target, { status: 303 });
}

export const GET = signOut;
export const POST = signOut;
