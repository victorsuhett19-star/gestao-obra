import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TIPO_EVENTO_LABEL, formatDate, formatHora } from "@/lib/labels";
import { deleteEvento } from "@/app/actions/agenda";

export const metadata: Metadata = {
  title: "Agenda do projeto — Gestão de Obra",
};

export default async function AgendaProjetoPage({
  params,
}: PageProps<"/projetos/[obraId]/agenda">) {
  const { obraId } = await params;

  const eventos = await prisma.evento.findMany({
    where: { obraId },
    orderBy: { data: "asc" },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Agenda</h2>
          <p className="text-sm text-slate-500">
            Reuniões, visitas e entregas relacionadas a este projeto.
          </p>
        </div>
        <Link
          href={`/projetos/${obraId}/agenda/novo`}
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          + Novo evento
        </Link>
      </div>

      {eventos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum evento agendado para este projeto ainda.
          </p>
          <Link
            href={`/projetos/${obraId}/agenda/novo`}
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Novo evento
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {eventos.map((e) => {
            const passado = e.data < hoje;
            return (
              <div
                key={e.id}
                className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-surface p-4 ${passado ? "opacity-60" : ""}`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{e.titulo}</p>
                  <p className="text-xs text-slate-500">
                    {TIPO_EVENTO_LABEL[e.tipo]} · {formatDate(e.data)} às {formatHora(e.data)}
                  </p>
                </div>
                <form action={deleteEvento.bind(null, e.id)}>
                  <button
                    type="submit"
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Excluir
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
