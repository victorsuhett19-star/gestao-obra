import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/labels";
import { getEmpresaAtivaId } from "@/lib/empresa";

export const metadata: Metadata = {
  title: "Materiais — Gestão de Obra",
};

export default async function MateriaisPage() {
  const empresaAtivaId = await getEmpresaAtivaId();
  const materiais = await prisma.material.findMany({
    where: { empresaId: empresaAtivaId ?? undefined },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Materiais</h1>
          <p className="text-sm text-slate-500">
            Catálogo de materiais usado nos pedidos de compra das obras.
          </p>
        </div>
        <Link
          href="/materiais/novo"
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          + Novo material
        </Link>
      </div>

      {materiais.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum material cadastrado ainda.
          </p>
          <Link
            href="/materiais/novo"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Novo material
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Unidade</th>
                <th className="px-4 py-3 text-right">Preço ref.</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {materiais.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {m.nome}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {m.categoria ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{m.unidade}</td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {m.precoReferencia ? formatBRL(m.precoReferencia) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/materiais/${m.id}/editar`}
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
