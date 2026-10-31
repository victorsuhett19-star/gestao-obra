"use client";

export function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700"
    >
      🖨️ Imprimir / salvar PDF
    </button>
  );
}
