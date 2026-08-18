import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CLIMA_LABEL } from "@/lib/labels";
import { ObjetivosPanel } from "./objetivos-panel";
import { deleteDiario } from "@/app/actions/diario";

export const metadata: Metadata = {
  title: "Diário de obra — Gestão de Obra",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function DiarioPage({
  params,
}: PageProps<"/obras/[obraId]/diario">) {
  const { obraId } = await params;

  const [objetivos, registros] = await Promise.all([
    prisma.objetivoDiario.findMany({
      where: { obraId },
      orderBy: { criadoEm: "asc" },
    }),
    prisma.diarioObra.findMany({
      where: { obraId },
      include: {
        fotos: true,
        colaboradores: { include: { colaborador: true } },
      },
      orderBy: { data: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Diário de obra
          </h2>
          <p className="text-sm text-slate-500">
            {registros.length} registro(s).
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/diario/novo`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Novo registro
        </Link>
      </div>

      <ObjetivosPanel obraId={obraId} objetivos={objetivos} />

      {registros.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum registro de diário ainda.
          </p>
          <Link
            href={`/obras/${obraId}/diario/novo`}
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Novo registro
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {registros.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(r.data)}
                    {r.clima && (
                      <span className="ml-2 text-sm font-normal text-slate-500">
                        {CLIMA_LABEL[r.clima]}
                      </span>
                    )}
                  </p>
                  {r.colaboradores.length > 0 && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      Equipe: {r.colaboradores.map((c) => c.colaborador.nome).join(", ")}
                    </p>
                  )}
                  {r.terceirizados && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      Terceirizados: {r.terceirizados}
                    </p>
                  )}
                </div>
                <form
                  action={async () => {
                    "use server";
                    await deleteDiario(r.id, obraId);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Excluir
                  </button>
                </form>
              </div>

              <p className="mt-3 text-sm text-slate-800">{r.atividadesRealizadas}</p>

              {r.necessidades && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <span className="font-medium">Necessidades: </span>
                  {r.necessidades}
                </p>
              )}

              {r.fotos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.fotos.map((f) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={f.id}
                      src={f.url}
                      alt={f.legenda ?? "Foto do diário"}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
