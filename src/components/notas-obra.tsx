import { adicionarNota, excluirNota } from "@/app/actions/projetos";
import { formatDate } from "@/lib/labels";

export function NotasObra({
  obraId,
  notas,
}: {
  obraId: string;
  notas: {
    id: string;
    texto: string;
    criadoEm: Date;
    criadoPor: { nome: string } | null;
  }[];
}) {
  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-slate-800">Anotações</p>
      <p className="mt-0.5 text-xs text-slate-400">
        Só a equipe interna vê isso — não aparece no portal do cliente.
      </p>
      <form action={adicionarNota.bind(null, obraId)} className="mt-3 flex flex-col gap-2">
        <textarea
          name="texto"
          rows={2}
          placeholder="Escreva uma anotação..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        <button
          type="submit"
          className="self-start rounded-lg bg-ink-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          Adicionar
        </button>
      </form>
      <div className="mt-4 flex flex-col gap-3">
        {notas.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma anotação ainda.</p>
        ) : (
          notas.map((nota) => (
            <div key={nota.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="whitespace-pre-wrap text-sm text-slate-700">{nota.texto}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {nota.criadoPor?.nome ?? "Equipe"} · {formatDate(nota.criadoEm)}
                </p>
                <form action={excluirNota.bind(null, nota.id, obraId)}>
                  <button
                    type="submit"
                    className="text-xs font-medium text-red-500 hover:underline"
                  >
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
