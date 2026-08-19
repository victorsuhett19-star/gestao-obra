import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { STATUS_OBRA_LABEL, STATUS_OBRA_COLOR } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Projetos — Gestão de Obra",
};

export default async function ProjetosPage({
  searchParams,
}: PageProps<"/projetos">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const empresaAtivaId = await getEmpresaAtivaId();

  const obras = await prisma.obra.findMany({
    where: {
      empresaId: empresaAtivaId ?? undefined,
      ...(status ? { status: status as never } : {}),
      ...(q
        ? {
            OR: [
              { nome: { contains: q, mode: "insensitive" } },
              { clienteNome: { contains: q, mode: "insensitive" } },
              { clienteTelefone: { contains: q, mode: "insensitive" } },
              { clienteEmail: { contains: q, mode: "insensitive" } },
              { clienteCpfCnpj: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      etapasProjeto: { where: { status: "EM_ANDAMENTO" }, take: 1 },
      _count: { select: { etapasProjeto: true } },
    },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Projetos</h1>
          <p className="text-sm text-slate-500">
            Linha do tempo de entrega de cada projeto — do briefing até a
            montagem final.
          </p>
        </div>
        <Link
          href="/projetos/configurar"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          ⚙️ Configurar etapas
        </Link>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, cliente, telefone ou e-mail..."
          className="min-w-[260px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_OBRA_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700"
        >
          Filtrar
        </button>
        <span className="ml-auto text-sm text-slate-500">
          {obras.length} projeto(s)
        </span>
      </form>

      <div className="overflow-hidden card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Projeto / Cliente</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Etapa atual</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {obras.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhum projeto encontrado.
                </td>
              </tr>
            ) : (
              obras.map((obra) => {
                const etapaAtual = obra.etapasProjeto[0];
                const total = obra._count.etapasProjeto;
                const percentual =
                  total > 0 && etapaAtual
                    ? Math.round((etapaAtual.ordem / total) * 100)
                    : 0;
                return (
                  <tr key={obra.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/projetos/${obra.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {obra.nome}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {obra.clienteNome || "Sem cliente"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{obra.clienteTelefone || "—"}</p>
                      <p className="text-xs text-slate-400">{obra.clienteEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      {etapaAtual ? (
                        <div className="max-w-[180px]">
                          <p className="text-slate-700">{etapaAtual.nome}</p>
                          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-orange-500"
                              style={{ width: `${percentual}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Fluxo não iniciado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_OBRA_COLOR[obra.status]}`}
                      >
                        {STATUS_OBRA_LABEL[obra.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/projetos/${obra.id}`}
                        className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-700"
                      >
                        Abrir →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
