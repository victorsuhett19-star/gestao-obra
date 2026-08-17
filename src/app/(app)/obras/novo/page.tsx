import type { Metadata } from "next";
import { ObraForm } from "../obra-form";

export const metadata: Metadata = {
  title: "Nova obra — Gestão de Obra",
};

export default function NovaObraPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Nova obra</h1>
        <p className="text-sm text-slate-500">
          Cadastre uma nova obra/projeto para começar a gerenciar o cronograma,
          orçamento e materiais.
        </p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <ObraForm />
      </div>
    </div>
  );
}
