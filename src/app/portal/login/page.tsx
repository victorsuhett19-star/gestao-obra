import type { Metadata } from "next";
import { getClientSessionPayload } from "@/lib/client-session";
import { redirect } from "next/navigation";
import { LoginClienteForm } from "./login-cliente-form";

export const metadata: Metadata = {
  title: "Portal do cliente — Gestão de Obra",
};

export default async function PortalLoginPage() {
  const session = await getClientSessionPayload();
  if (session?.clienteId) {
    redirect("/portal");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-empresa.png" alt="" className="mb-3 h-12 w-auto" />
          <h1 className="text-lg font-semibold text-slate-900">
            Portal do cliente
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe o andamento do seu projeto
          </p>
        </div>
        <LoginClienteForm />
      </div>
    </div>
  );
}
