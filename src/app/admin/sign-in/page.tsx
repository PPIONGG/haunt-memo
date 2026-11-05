import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

const ERRORS: Record<string, string> = {
  not_authorised: "บัญชีนี้ไม่มีสิทธิ์เข้าส่วนจัดการ ระบบได้ออกจากระบบให้แล้ว",
  sign_in_failed: "เข้าสู่ระบบไม่สำเร็จ ลองอีกครั้ง",
};

export default function SignInPage(props: PageProps<"/admin/sign-in">) {
  return (
    <main className="mx-auto grid w-full max-w-sm flex-1 content-center gap-6 px-4 py-16 text-center">
      <h1 className="font-heading text-2xl font-semibold">ส่วนจัดการของผู้คัดสรร</h1>
      <Suspense>
        <SignInError searchParams={props.searchParams} />
      </Suspense>
      <SignInForm />
    </main>
  );
}

async function SignInError({ searchParams }: Pick<PageProps<"/admin/sign-in">, "searchParams">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
      {message}
    </p>
  );
}
