"use client";

import { useActionState } from "react";
import { analisarPdfExecutivo } from "@/app/actions/orcamento-ia";

export function AnalisePdfForm({ orcamentoId }: { orcamentoId: string }) {
  const [state, action, pending] = useActionState(
    analisarPdfExecutivo.bind(null, orcamentoId),
    undefined
  );

  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          name="arquivo"
          accept="application/pdf"
          required
          className="flex-1 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700 disabled:opacity-60"
        >
          {pending ? "Analisando..." : "🤖 Analisar com IA"}
        </button>
      </div>
      {state?.message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            state.sucesso ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
