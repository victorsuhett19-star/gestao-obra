import {
  salvarTemplate,
  excluirTemplate,
  gerarRelatorio,
  excluirRelatorio,
} from "@/app/actions/relatorios";
import { formatDate } from "@/lib/labels";

export function RelatorioTab({
  obraId,
  templates,
  relatorios,
}: {
  obraId: string;
  templates: { id: string; nome: string; corpo: string }[];
  relatorios: {
    id: string;
    templateNome: string;
    criadoEm: Date;
    criadoPor: { nome: string } | null;
  }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-200 bg-surface p-5">
        <p className="text-sm font-semibold text-slate-800">Gerar relatório</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Escolha um template já criado — o relatório sai em PDF com os dados
          da obra preenchidos automaticamente.
        </p>
        {templates.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Nenhum template criado ainda. Crie um abaixo antes de gerar um
            relatório.
          </p>
        ) : (
          <form action={gerarRelatorio.bind(null, obraId)} className="mt-3 flex flex-wrap items-center gap-2">
            <select
              name="templateId"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
            >
              Gerar relatório
            </button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-surface p-5">
        <p className="text-sm font-semibold text-slate-800">
          Relatórios gerados
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {relatorios.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum relatório gerado ainda.</p>
          ) : (
            relatorios.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{r.templateNome}</p>
                  <p className="text-xs text-slate-400">
                    {r.criadoPor?.nome ?? "Equipe"} · {formatDate(r.criadoEm)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <a
                    href={`/api/relatorios/${r.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-slate-700 hover:underline"
                  >
                    Baixar PDF
                  </a>
                  <form action={excluirRelatorio.bind(null, r.id, obraId)}>
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

      <div className="rounded-2xl border border-slate-200 bg-surface p-5">
        <p className="text-sm font-semibold text-slate-800">Templates</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Base reutilizável em qualquer projeto/obra. Use{" "}
          <code className="rounded bg-slate-100 px-1">{"{{obra}}"}</code>,{" "}
          <code className="rounded bg-slate-100 px-1">{"{{cliente}}"}</code>,{" "}
          <code className="rounded bg-slate-100 px-1">{"{{endereco}}"}</code> e{" "}
          <code className="rounded bg-slate-100 px-1">{"{{data}}"}</code> pra
          serem substituídos automaticamente ao gerar.
        </p>
        <form action={salvarTemplate.bind(null, obraId)} className="mt-3 flex flex-col gap-2">
          <input
            name="nome"
            placeholder="Nome do template (ex: Relatório mensal de acompanhamento)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <textarea
            name="corpo"
            rows={4}
            placeholder={
              "Ex: Relatório da obra {{obra}}, cliente {{cliente}}, em {{endereco}}.\nData de emissão: {{data}}."
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="submit"
            className="self-start rounded-lg bg-ink-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-ink-700"
          >
            Salvar template
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
          {templates.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum template criado ainda.</p>
          ) : (
            templates.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">{t.nome}</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-xs text-slate-500">
                    {t.corpo}
                  </p>
                </div>
                <form action={excluirTemplate.bind(null, t.id, obraId)}>
                  <button
                    type="submit"
                    className="shrink-0 text-xs font-medium text-red-500 hover:underline"
                  >
                    Excluir
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
