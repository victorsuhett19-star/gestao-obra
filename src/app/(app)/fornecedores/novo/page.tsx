import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { FornecedorForm } from "../fornecedor-form";

export const metadata: Metadata = {
  title: "Novo fornecedor — Gestão de Obra",
};

export default function NovoFornecedorPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/fornecedores" label="Fornecedores" />
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Novo fornecedor
        </h1>
      </div>
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
        <FornecedorForm />
      </div>
    </div>
  );
}
