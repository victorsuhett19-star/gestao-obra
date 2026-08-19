import type { ModuloKey } from "@/lib/modulos";

// Itens de navegação do painel. Cada fase do projeto acrescenta uma entrada
// aqui conforme as páginas correspondentes vão sendo construídas. `modulo`
// referencia a chave de permissão em src/lib/permissoes.ts usada para
// decidir se o item aparece para o usuário logado.
export const navItems: { href: string; label: string; modulo?: ModuloKey }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/atendimento", label: "Atendimento", modulo: "atendimento" },
  { href: "/projetos", label: "Projetos", modulo: "projetos" },
  { href: "/obras", label: "Obras", modulo: "obras" },
  { href: "/marcenaria", label: "🪚 Marcenaria", modulo: "marcenaria" },
  { href: "/marmoraria", label: "🪨 Marmoraria", modulo: "marmoraria" },
  { href: "/vidracaria", label: "🪟 Vidraçaria", modulo: "vidracaria" },
  { href: "/agenda", label: "Agenda", modulo: "agenda" },
  { href: "/financeiro", label: "Financeiro", modulo: "financeiro" },
  { href: "/colaboradores", label: "Colaboradores", modulo: "colaboradores" },
  { href: "/rh", label: "RH", modulo: "rh" },
  { href: "/usuarios", label: "Usuários", modulo: "usuarios" },
  { href: "/empresas", label: "Empresas", modulo: "empresas" },
];
