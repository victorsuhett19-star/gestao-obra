"use client";

import { useActionState, useRef } from "react";
import { criarEtapaTemplate } from "@/app/actions/etapa-projeto-template";

export function EtapaTemplateForm({ trade }: { trade: string }) {
  const [state, action, pending] = useActionState(criarEtapaTemplate, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-2"
    >
      <input type="hidden" name="trade" value={trade} />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Nome da etapa
        </label>
        <input
          name="nome"
          placeholder="Ex: Envio de planta / Briefing"
          className="w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
        />
        {state?.errors?.nome && (
          <p className="text-xs text-red-600">{state.errors.nome[0]}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Grupo (opcional)
        </label>
        <input
          name="grupo"
          placeholder="Ex: 2ª Produção"
          className="w-40 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60"
      >
        {pending ? "Adicionando..." : "+ Adicionar etapa"}
      </button>
    </form>
  );
}
