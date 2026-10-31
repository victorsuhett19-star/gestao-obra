import { formatDate, formatHora } from "@/lib/labels";

type Nota = {
  id: string;
  texto: string;
  resolvida: boolean;
  criadoEm: Date;
  autorUsuario: { nome: string } | null;
  autorCliente: { nome: string } | null;
};

// Notas entre o cliente e a equipe da obra. Usada na Área do cliente (equipe)
// e no portal (cliente) — `lado` define como o autor aparece e se a nota
// pode ser resolvida/excluída.
export function NotasCliente({
  notas,
  lado,
  onAdicionar,
  criarAcaoResolver,
  criarAcaoExcluir,
}: {
  notas: Nota[];
  lado: "equipe" | "cliente";
  onAdicionar: (formData: FormData) => void | Promise<void>;
  criarAcaoResolver?: (notaId: string) => (formData: FormData) => void | Promise<void>;
  criarAcaoExcluir?: (notaId: string) => (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-800">
          {lado === "cliente" ? "Notas para a equipe da obra" : "Notas do cliente"}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {lado === "cliente"
            ? "Escreva aqui uma dúvida ou algo que precise falar com a equipe — ela responde por aqui."
            : "Dúvidas e recados do cliente. Responda por aqui e marque como resolvida."}
        </p>
        <form action={onAdicionar} className="mt-3 flex flex-col gap-2">
          <textarea
            name="texto"
            rows={3}
            required
            placeholder={lado === "cliente" ? "Escreva sua dúvida ou recado..." : "Escreva uma resposta ou nota..."}
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            className="self-start rounded-lg bg-ink-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-ink-700"
          >
            Enviar nota
          </button>
        </form>
      </div>

      {notas.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhuma nota ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notas.map((n) => {
            const ehCliente = !!n.autorCliente;
            const autor = ehCliente
              ? lado === "cliente"
                ? "Você"
                : `${n.autorCliente?.nome} (cliente)`
              : (n.autorUsuario?.nome ?? "Equipe");
            return (
              <div
                key={n.id}
                className={`card p-4 ${n.resolvida ? "opacity-60" : ""} ${ehCliente ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-sky-500"}`}
              >
                <p className="whitespace-pre-wrap text-sm text-slate-800">{n.texto}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    {autor} · {formatDate(n.criadoEm)} às {formatHora(n.criadoEm)}
                    {n.resolvida && (
                      <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-500">
                        Resolvida
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-3">
                    {criarAcaoResolver && (
                      <form action={criarAcaoResolver(n.id)}>
                        <button type="submit" className="font-medium text-slate-600 hover:underline">
                          {n.resolvida ? "Reabrir" : "Marcar como resolvida"}
                        </button>
                      </form>
                    )}
                    {criarAcaoExcluir && (
                      <form action={criarAcaoExcluir(n.id)}>
                        <button type="submit" className="font-medium text-red-500 hover:underline">
                          Excluir
                        </button>
                      </form>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
