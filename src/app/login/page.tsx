import type { Metadata } from "next";
import { getSessionPayload } from "@/lib/session";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar — Gestão de Obra",
};

export default async function LoginPage() {
  const session = await getSessionPayload();
  if (session?.userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-surface p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-empresa.png" alt="" className="mb-3 h-12 w-auto" />
          <h1 className="text-lg font-semibold text-slate-900">
            Gestão de Obra
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Entre com sua conta da empresa
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
