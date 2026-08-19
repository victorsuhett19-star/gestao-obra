import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { UsuarioForm } from "../usuario-form";

export const metadata: Metadata = {
  title: "Novo usuário — Gestão de Obra",
};

export default function NovoUsuarioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/usuarios" label="Usuários" />
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Novo usuário
        </h1>
        <p className="text-sm text-slate-500">
          Cria um login para um funcionário acessar o sistema.
        </p>
      </div>
      <div className="max-w-lg card p-6">
        <UsuarioForm />
      </div>
    </div>
  );
}
