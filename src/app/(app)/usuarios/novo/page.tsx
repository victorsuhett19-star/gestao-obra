import type { Metadata } from "next";
import { UsuarioForm } from "../usuario-form";

export const metadata: Metadata = {
  title: "Novo usuário — Gestão de Obra",
};

export default function NovoUsuarioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Novo usuário
        </h1>
        <p className="text-sm text-slate-500">
          Cria um login para um funcionário acessar o sistema.
        </p>
      </div>
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
        <UsuarioForm />
      </div>
    </div>
  );
}
