function iniciaisDe(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeiras = partes.length === 1 ? partes[0][0] : partes[0][0] + partes[partes.length - 1][0];
  return primeiras.toUpperCase();
}

// Barra fixa no topo, visível em todas as páginas internas — sempre mostra
// quem está logado (nome, não a função) pra ficar claro de qual conta é a
// sessão, especialmente útil em telas/celulares compartilhados pela equipe.
export function TopBar({ nome, papel }: { nome: string; papel: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-end gap-3 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur sm:px-8">
      <div className="text-right leading-tight">
        <p className="text-sm font-medium text-slate-900">{nome}</p>
        <p className="text-[11px] text-slate-400">{papel}</p>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
        {iniciaisDe(nome)}
      </div>
    </header>
  );
}
