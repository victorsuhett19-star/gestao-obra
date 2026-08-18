import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Fornecedores — Gestão de Obra",
};

export default async function FornecedoresPage() {
  const fornecedores = await prisma.fornecedor.findMany({
    orderBy: { nome: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Fornecedores
          </h1>
          <p className="text-sm text-slate-500">
            Catálogo de fornecedores usado nos pedidos de material das obras.
          </p>
        </div>
        <Link
          href="/fornecedores/novo"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Novo fornecedor
        </Link>
      </div>

      {fornecedores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum fornecedor cadastrado ainda.
          </p>
          <Link
            href="/fornecedores/novo"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Novo fornecedor
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Especialidade</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {f.nome}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {f.especialidade ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {f.telefone ?? f.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/fornecedores/${f.id}/editar`}
                      className="text-xs font-medium text-slate-600 hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
