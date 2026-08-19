"use client";

import { useState } from "react";

type Tema = "light" | "dark" | "system";

function aplicarTema(tema: Tema) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (tema !== "system") root.classList.add(tema);
  localStorage.setItem("tema", tema);
}

/** Botão que alterna claro → escuro → automático (sistema), disponível pra
 * qualquer usuário (equipe ou cliente) escolher o modo de exibição. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [tema, setTema] = useState<Tema>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("tema") as Tema | null) ?? "system";
  });

  function alternar() {
    const proximo: Tema = tema === "light" ? "dark" : tema === "dark" ? "system" : "light";
    setTema(proximo);
    aplicarTema(proximo);
  }

  const rotulo =
    tema === "light" ? "☀️ Claro" : tema === "dark" ? "🌙 Escuro" : "🖥️ Automático";

  return (
    <button
      type="button"
      onClick={alternar}
      title="Alternar modo claro/escuro/automático"
      suppressHydrationWarning
      className={`rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 ${className}`}
    >
      {rotulo}
    </button>
  );
}
