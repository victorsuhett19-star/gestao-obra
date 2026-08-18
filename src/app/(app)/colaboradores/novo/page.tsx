import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { ColaboradorForm } from "../colaborador-form";

export const metadata: Metadata = {
  title: "Novo colaborador — Gestão de Obra",
};

export default function NovoColaboradorPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/colaboradores" label="Colaboradores" />
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Novo colaborador
        </h1>
        <p className="text-sm text-slate-500">
          Cadastre um membro da equipe de campo.
        </p>
      </div>

      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
        <ColaboradorForm />
      </div>
    </div>
  );
}
