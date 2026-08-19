import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifyClientSession, getCliente } from "@/lib/client-dal";
import { STATUS_OBRA_LABEL, STATUS_OBRA_COLOR } from "@/lib/labels";
import { PortalHeader } from "./portal-header";

export const metadata: Metadata = {
  title: "Meus projetos — Portal do cliente",
};

export default async function PortalDashboardPage() {
  await verifyClientSession();
  const cliente = await getCliente();
  if (!cliente) return null;

  const obras = await prisma.obra.findMany({
    where: { clienteAcessoId: cliente.id },
    include: {
      etapasProjeto: { where: { status: "EM_ANDAMENTO" }, take: 1 },
      _count: { select: { etapasProjeto: true } },
    },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader nome={cliente.nome} />
      <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-8">
        <h1 className="text-lg font-semibold text-slate-900">Meus projetos</h1>
        {obras.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhum projeto vinculado à sua conta ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {obras.map((obra) => {
              const etapaAtual = obra.etapasProjeto[0];
              return (
                <Link
                  key={obra.id}
                  href={`/portal/obras/${obra.id}`}
                  className="flex items-center justify-between card p-5 transition hover:border-slate-300"
                >
                  <div>
                    <p className="font-medium text-slate-900">{obra.nome}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {etapaAtual
                        ? `Etapa atual: ${etapaAtual.nome}`
                        : "Fluxo ainda não iniciado"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_OBRA_COLOR[obra.status]}`}
                  >
                    {STATUS_OBRA_LABEL[obra.status]}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
