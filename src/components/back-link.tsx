"use client";

import { useRouter } from "next/navigation";

/**
 * Botão "← Voltar" universal. Prefere o histórico real do navegador
 * (preserva filtros/scroll da tela anterior); se a página foi aberta direto
 * (link salvo, nova aba, atualizar a página), cai no `href` de fallback —
 * a lista "pai" dessa tela — pra sempre ter um jeito de voltar.
 */
export function BackLink({
  href,
  label = "Voltar",
}: {
  href: string;
  label?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(href);
        }
      }}
      className="text-sm text-slate-500 hover:text-slate-800 hover:underline"
    >
      ← {label}
    </button>
  );
}
