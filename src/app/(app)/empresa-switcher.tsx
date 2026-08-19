"use client";

import { useRef } from "react";
import { trocarEmpresa } from "@/app/actions/empresa";

export function EmpresaSwitcher({
  empresas,
  empresaAtivaId,
}: {
  empresas: { id: string; nome: string }[];
  empresaAtivaId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  // Com uma única empresa não há nada pra escolher — não mostra nada no
  // menu. O seletor só aparece quando o usuário tem acesso a mais de uma.
  if (empresas.length <= 1) {
    return null;
  }

  return (
    <form ref={formRef} action={trocarEmpresa} className="px-2">
      <select
        name="empresaId"
        defaultValue={empresaAtivaId}
        onChange={() => formRef.current?.requestSubmit()}
        className="w-full rounded-lg border border-slate-300 bg-surface px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-slate-500"
      >
        {empresas.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nome}
          </option>
        ))}
      </select>
    </form>
  );
}
