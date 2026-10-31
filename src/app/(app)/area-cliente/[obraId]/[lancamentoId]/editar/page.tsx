import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { editarLancamentoCliente } from "@/app/actions/area-cliente";

export const metadata: Metadata = {
  title: "Editar lançamento — Área do cliente",
};

export default async function EditarLancamentoClientePage({
  params,
}: PageProps<"/area-cliente/[obraId]/[lancamentoId]/editar">) {
  const { obraId, lancamentoId } = await params;
  const l = await prisma.lancamentoCliente.findFirst({
    where: { id: lancamentoId, obraId },
  });
  if (!l) notFound();

  const campo =
    "rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500";
  const valorTexto = l.valor.toFixed(2).replace(".", ",");

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <Link href={`/area-cliente/${obraId}`} className="text-sm text-slate-500 hover:underline">
        ← Voltar
      </Link>
      <h1 className="text-xl font-semibold text-slate-900">Editar gasto</h1>
      <form
        action={editarLancamentoCliente.bind(null, obraId, lancamentoId)}
        className="card flex flex-col gap-3 p-5"
      >
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Descrição
          <input name="descricao" required defaultValue={l.descricao} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          Categoria
          <input name="categoria" defaultValue={l.categoria ?? ""} className={campo} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Valor
            <input name="valor" required inputMode="decimal" defaultValue={valorTexto} className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Data
            <input
              name="data"
              type="date"
              defaultValue={l.data.toISOString().slice(0, 10)}
              className={campo}
            />
          </label>
        </div>
        <button
          type="submit"
          className="self-start rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
