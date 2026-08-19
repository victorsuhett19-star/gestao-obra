"use client";

import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";
import Link from "next/link";
import { moverAtendimentoPara, converterEmObra, deleteAtendimento } from "@/app/actions/atendimento";
import { STATUS_ATENDIMENTO } from "@/lib/definitions";
import { STATUS_ATENDIMENTO_LABEL, ORIGEM_ATENDIMENTO_LABEL, formatBRL } from "@/lib/labels";

type Atendimento = {
  id: string;
  nomeCliente: string;
  origem: string;
  ambienteDesejado: string | null;
  valorEstimado: number | null;
  status: string;
  motivoPerda: string | null;
  obraId: string | null;
  vendedor: { nome: string } | null;
};

export function AtendimentoKanban({ atendimentos }: { atendimentos: Atendimento[] }) {
  const router = useRouter();
  const [arrastando, setArrastando] = useState<string | null>(null);

  async function onDrop(e: DragEvent, status: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/atendimento-id");
    if (!id) return;
    await moverAtendimentoPara(id, status);
    router.refresh();
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {STATUS_ATENDIMENTO.map((status) => {
        const itens = atendimentos.filter((a) => a.status === status);
        const ehPerdido = status === "PERDIDO";
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, status)}
            className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {STATUS_ATENDIMENTO_LABEL[status]}
              </p>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                {itens.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {itens.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/atendimento-id", item.id);
                    setArrastando(item.id);
                  }}
                  onDragEnd={() => setArrastando(null)}
                  className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing ${
                    ehPerdido ? "opacity-70" : ""
                  } ${arrastando === item.id ? "opacity-40" : ""}`}
                >
                  <Link
                    href={`/atendimento/${item.id}/editar`}
                    className="text-sm font-medium text-slate-900 hover:underline"
                  >
                    {item.nomeCliente}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {ORIGEM_ATENDIMENTO_LABEL[item.origem]}
                    {item.ambienteDesejado && ` · ${item.ambienteDesejado}`}
                  </p>
                  {item.valorEstimado && (
                    <p className="mt-0.5 text-xs font-medium text-slate-700">
                      {formatBRL(item.valorEstimado)}
                    </p>
                  )}
                  {item.vendedor && (
                    <p className="mt-0.5 text-xs text-slate-500">{item.vendedor.nome}</p>
                  )}
                  {ehPerdido && item.motivoPerda && (
                    <p className="mt-0.5 text-xs text-slate-500">{item.motivoPerda}</p>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    {status === "GANHO" && !item.obraId ? (
                      <form action={converterEmObra.bind(null, item.id)}>
                        <button
                          type="submit"
                          className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                        >
                          Converter em obra
                        </button>
                      </form>
                    ) : (
                      <span className="text-[11px] text-slate-400">arraste pra mudar</span>
                    )}
                    <form action={deleteAtendimento.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-500 hover:underline"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {itens.length === 0 && (
                <p className="px-1 py-4 text-center text-xs text-slate-400">
                  Arraste um card aqui
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
