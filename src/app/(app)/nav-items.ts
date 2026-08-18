import type { ModuloKey } from "@/lib/modulos";

// Itens de navegação do painel. Cada fase do projeto acrescenta uma entrada
// aqui conforme as páginas correspondentes vão sendo construídas. `modulo`
// referencia a chave de permissão em src/lib/permissoes.ts usada para
// decidir se o item aparece para o usuário logado.
export const navItems: { href: string; label: string; modulo?: ModuloKey }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/atendimento", label: "Atendimento", modulo: "atendimento" },
  { href: "/obras", label: "Obras", modulo: "obras" },
  { href: "/agenda", label: "Agenda", modulo: "agenda" },
  { href: "/financeiro", label: "Financeiro", modulo: "financeiro" },
  { href: "/colaboradores", label: "Colaboradores", modulo: "colaboradores" },
  { href: "/rh", label: "RH", modulo: "rh" },
  { href: "/fornecedores", label: "Fornecedores", modulo: "fornecedores" },
  { href: "/materiais", label: "Materiais", modulo: "materiais" },
  { href: "/usuarios", label: "Usuários", modulo: "usuarios" },
  { href: "/empresas", label: "Empresas", modulo: "empresas" },
];
