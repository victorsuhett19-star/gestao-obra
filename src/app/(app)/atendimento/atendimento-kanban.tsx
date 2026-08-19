"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { moverAtendimentoPara, converterEmObra, deleteAtendimento } from "@/app/actions/atendimento";
import { STATUS_ATENDIMENTO } from "@/lib/definitions";
import { STATUS_ATENDIMENTO_LABEL, ORIGEM_ATENDIMENTO_LABEL, TRADE_LABEL, formatBRL } from "@/lib/labels";

type Atendimento = {
  id: string;
  nomeCliente: string;
  origem: string;
  ambienteDesejado: string | null;
  valorEstimado: number | null;
  status: string;
  motivoPerda: string | null;
  obraId: string | null;
  cor: string | null;
  vendedor: { nome: string } | null;
  especialidades: { trade: string }[];
};

// Distância da borda (em px) a partir da qual a rolagem automática entra em
// ação, e velocidade máxima de rolagem (px por frame).
const MARGEM_AUTOSCROLL = 90;
const VELOCIDADE_MAX = 18;

export function AtendimentoKanban({ atendimentos }: { atendimentos: Atendimento[] }) {
  const router = useRouter();
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [colunaAlvo, setColunaAlvo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  function pararAutoScroll() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function iniciarAutoScroll(velocidade: number) {
    pararAutoScroll();
    const passo = () => {
      const el = scrollRef.current;
      if (el) el.scrollLeft += velocidade;
      rafRef.current = requestAnimationFrame(passo);
    };
    rafRef.current = requestAnimationFrame(passo);
  }

  function onDragOverContainer(e: DragEvent) {
    e.preventDefault();
    const container = scrollRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const distEsquerda = e.clientX - rect.left;
    const distDireita = rect.right - e.clientX;

    if (distEsquerda < MARGEM_AUTOSCROLL) {
      const forca = 1 - Math.max(0, distEsquerda) / MARGEM_AUTOSCROLL;
      iniciarAutoScroll(-Math.max(2, forca * VELOCIDADE_MAX));
    } else if (distDireita < MARGEM_AUTOSCROLL) {
      const forca = 1 - Math.max(0, distDireita) / MARGEM_AUTOSCROLL;
      iniciarAutoScroll(Math.max(2, forca * VELOCIDADE_MAX));
    } else {
      pararAutoScroll();
    }
  }

  async function onDrop(e: DragEvent, status: string) {
    e.preventDefault();
    pararAutoScroll();
    setColunaAlvo(null);
    const id = e.dataTransfer.getData("text/atendimento-id");
    if (!id) return;
    await moverAtendimentoPara(id, status);
    router.refresh();
  }

  async function mudarStatus(id: string, novoStatus: string) {
    await moverAtendimentoPara(id, novoStatus);
    router.refresh();
  }

  return (
    <div
      ref={scrollRef}
      onDragOver={onDragOverContainer}
      onDragEnd={pararAutoScroll}
      className="scrollbar-hide flex gap-4 overflow-x-auto pb-2 scroll-smooth"
    >
      {STATUS_ATENDIMENTO.map((status) => {
        const itens = atendimentos.filter((a) => a.status === status);
        const ehPerdido = status === "PERDIDO";
        return (
          <div
            key={status}
            onDragEnter={() => setColunaAlvo(status)}
            onDragLeave={(e) => {
              if (e.currentTarget === e.target) setColunaAlvo((c) => (c === status ? null : c));
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, status)}
            className={`flex w-72 shrink-0 flex-col gap-3 rounded-2xl border p-3 transition-colors duration-150 ${
              colunaAlvo === status
                ? "border-slate-400 bg-slate-100"
                : "border-slate-200 bg-slate-50"
            }`}
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
                    e.dataTransfer.effectAllowed = "move";
                    // pequeno atraso pra não "sumir" o card antes do navegador
                    // terminar de gerar a imagem de arraste — evita o piscar.
                    requestAnimationFrame(() => setArrastando(item.id));
                  }}
                  onDragEnd={() => {
                    setArrastando(null);
                    setColunaAlvo(null);
                    pararAutoScroll();
                  }}
                  style={item.cor ? { borderLeft: `4px solid ${item.cor}` } : undefined}
                  className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-150 ease-out active:cursor-grabbing ${
                    ehPerdido ? "opacity-70" : ""
                  } ${arrastando === item.id ? "scale-95 opacity-30" : "scale-100"}`}
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
                  {item.especialidades.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.especialidades.map((e) => (
                        <span
                          key={e.trade}
                          className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {TRADE_LABEL[e.trade]}
                        </span>
                      ))}
                    </div>
                  )}
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

                  <div className="mt-2 flex items-center gap-1.5">
                    <select
                      value={status}
                      onChange={(e) => mudarStatus(item.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 text-[11px] text-slate-600 outline-none focus:border-slate-400"
                    >
                      {STATUS_ATENDIMENTO.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_ATENDIMENTO_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    <form action={deleteAtendimento.bind(null, item.id)}>
                      <button
                        type="submit"
                        className="shrink-0 text-xs font-medium text-red-500 hover:underline"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                  {status === "GANHO" && !item.obraId && (
                    <form action={converterEmObra.bind(null, item.id)} className="mt-1.5">
                      <button
                        type="submit"
                        className="w-full rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        Converter em obra
                      </button>
                    </form>
                  )}
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
