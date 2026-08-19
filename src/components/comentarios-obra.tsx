import { formatDate } from "@/lib/labels";

type Comentario = {
  id: string;
  texto: string;
  criadoEm: Date;
  autorUsuario: { nome: string } | null;
  autorCliente: { nome: string } | null;
};

export function ComentariosObra({
  comentarios,
  onAdicionar,
  criarAcaoExcluir,
  autorAtualEhCliente = false,
}: {
  comentarios: Comentario[];
  /** Server action já vinculada (bind) ao obraId. */
  onAdicionar: (formData: FormData) => void | Promise<void>;
  /** Opcional — quando ausente, o comentário não pode ser excluído (ex: portal do cliente). */
  criarAcaoExcluir?: (comentarioId: string) => (formData: FormData) => void | Promise<void>;
  autorAtualEhCliente?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-800">Comentários</p>
      <p className="mt-0.5 text-xs text-slate-400">
        Descreva situações que ocorreram no trabalho, para que todos os
        envolvidos fiquem cientes.
      </p>
      <form action={onAdicionar} className="mt-3 flex flex-col gap-2">
        <textarea
          name="texto"
          rows={2}
          placeholder="Escreva um comentário..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        <button
          type="submit"
          className="self-start rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Comentar
        </button>
      </form>
      <div className="mt-4 flex flex-col gap-3">
        {comentarios.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum comentário ainda.</p>
        ) : (
          comentarios.map((c) => {
            const autor = c.autorUsuario?.nome
              ? c.autorUsuario.nome
              : c.autorCliente?.nome
                ? autorAtualEhCliente
                  ? "Você"
                  : `${c.autorCliente.nome} (cliente)`
                : "Equipe";
            return (
              <div key={c.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="whitespace-pre-wrap text-sm text-slate-700">{c.texto}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {autor} · {formatDate(c.criadoEm)}
                  </p>
                  {criarAcaoExcluir && (
                    <form action={criarAcaoExcluir(c.id)}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-500 hover:underline"
                      >
                        Excluir
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
