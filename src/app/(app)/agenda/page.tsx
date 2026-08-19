import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TIPO_EVENTO_LABEL } from "@/lib/labels";
import { deleteEvento } from "@/app/actions/agenda";
import { getEmpresaAtivaId } from "@/lib/empresa";

export const metadata: Metadata = {
  title: "Agenda — Gestão de Obra",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
  }).format(date);
}

function formatHora(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export default async function AgendaPage() {
  const empresaAtivaId = await getEmpresaAtivaId();
  const eventos = await prisma.evento.findMany({
    where: { empresaId: empresaAtivaId ?? undefined },
    include: { obra: { select: { nome: true } }, criadoPor: { select: { nome: true } } },
    orderBy: { data: "asc" },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const proximos = eventos.filter((e) => e.data >= hoje);
  const passados = eventos.filter((e) => e.data < hoje).reverse();

  const grupos = new Map<string, typeof proximos>();
  for (const evento of proximos) {
    const chave = formatDate(evento.data);
    grupos.set(chave, [...(grupos.get(chave) ?? []), evento]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Agenda</h1>
          <p className="text-sm text-slate-500">
            {proximos.length} evento(s) futuro(s).
          </p>
        </div>
        <Link
          href="/agenda/novo"
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          + Agendar
        </Link>
      </div>

      {proximos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
          <p className="text-sm text-slate-500">Nenhum evento agendado.</p>
          <Link
            href="/agenda/novo"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Agendar
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {[...grupos.entries()].map(([dia, eventosDoDia]) => (
            <div key={dia}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {dia}
              </p>
              <div className="flex flex-col gap-2">
                {eventosDoDia.map((evento) => (
                  <div
                    key={evento.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-surface p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {formatHora(evento.data)} · {evento.titulo}
                      </p>
                      <p className="text-xs text-slate-500">
                        {TIPO_EVENTO_LABEL[evento.tipo]}
                        {evento.obra && ` · ${evento.obra.nome}`}
                        {evento.criadoPor && ` · ${evento.criadoPor.nome}`}
                      </p>
                    </div>
                    <form action={deleteEvento.bind(null, evento.id)}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-500 hover:underline"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {passados.length > 0 && (
        <details className="rounded-2xl border border-slate-200 bg-surface p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-600">
            Eventos passados ({passados.length})
          </summary>
          <div className="mt-3 flex flex-col gap-2">
            {passados.map((evento) => (
              <div key={evento.id} className="text-sm text-slate-500">
                {formatDate(evento.data)} {formatHora(evento.data)} — {evento.titulo}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
