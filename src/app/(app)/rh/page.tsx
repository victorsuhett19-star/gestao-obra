import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";

export const metadata: Metadata = {
  title: "RH — Gestão de Obra",
};

export default async function RhPage() {
  const empresaAtivaId = await getEmpresaAtivaId();
  const colaboradores = await prisma.colaborador.findMany({
    where: { empresaId: empresaAtivaId ?? undefined },
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">RH</h1>
        <p className="text-sm text-slate-500">
          Ponto, férias/folgas e folha de pagamento por colaborador.
        </p>
      </div>

      {colaboradores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum colaborador cadastrado ainda.
          </p>
          <Link
            href="/colaboradores/novo"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Novo colaborador
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colaboradores.map((c) => (
            <Link
              key={c.id}
              href={`/rh/${c.id}`}
              className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-surface p-4 hover:bg-slate-50 ${
                c.ativo ? "" : "opacity-50"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                {c.nome.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {c.nome}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {c.funcao ?? "—"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
