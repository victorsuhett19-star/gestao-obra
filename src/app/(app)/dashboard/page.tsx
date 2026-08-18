import type { Metadata } from "next";
import { getUser } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Dashboard — Gestão de Obra",
};

export default async function DashboardPage() {
  const user = await getUser();
  const empresaAtivaId = await getEmpresaAtivaId();
  const totalObras = await prisma.obra.count({
    where: { empresaId: empresaAtivaId ?? undefined },
  });
  const obrasEmAndamento = await prisma.obra.count({
    where: { empresaId: empresaAtivaId ?? undefined, status: "EM_ANDAMENTO" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Olá, {user?.nome ?? "usuário"}
        </h1>
        <p className="text-sm text-slate-500">
          Visão geral das suas obras.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Obras cadastradas</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {totalObras}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Em andamento</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {obrasEmAndamento}
          </p>
        </div>
      </div>
    </div>
  );
}
