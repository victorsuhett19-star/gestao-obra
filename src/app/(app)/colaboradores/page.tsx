import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { alternarAtivoColaborador } from "@/app/actions/colaboradores";

export const metadata: Metadata = {
  title: "Colaboradores — Gestão de Obra",
};

export default async function ColaboradoresPage() {
  const empresaAtivaId = await getEmpresaAtivaId();
  const colaboradores = await prisma.colaborador.findMany({
    where: { empresaId: empresaAtivaId ?? undefined },
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Colaboradores
          </h1>
          <p className="text-sm text-slate-500">
            Equipe de campo — usada para marcar presença no diário de obra.
          </p>
        </div>
        <Link
          href="/colaboradores/novo"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Novo colaborador
        </Link>
      </div>

      {colaboradores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
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
            <div
              key={c.id}
              className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 ${
                c.ativo ? "" : "opacity-50"
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-medium text-slate-500">
                {c.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.fotoUrl}
                    alt={c.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  c.nome.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {c.nome}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {c.funcao ?? "—"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Link
                  href={`/colaboradores/${c.id}/editar`}
                  className="text-xs font-medium text-slate-600 hover:underline"
                >
                  Editar
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await alternarAtivoColaborador(c.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs font-medium text-slate-400 hover:underline"
                  >
                    {c.ativo ? "Desativar" : "Ativar"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
