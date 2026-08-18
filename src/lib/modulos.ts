// Constantes de módulos/permissões que podem ser importadas tanto no
// servidor quanto em Client Components (formulário de usuário). A checagem
// que depende de sessão (requireModulo) fica em src/lib/permissoes.ts,
// que é server-only.

export const MODULOS = [
  { key: "atendimento", label: "Atendimento" },
  { key: "obras", label: "Obras" },
  { key: "agenda", label: "Agenda" },
  { key: "financeiro", label: "Financeiro" },
  { key: "colaboradores", label: "Colaboradores" },
  { key: "rh", label: "RH" },
  { key: "fornecedores", label: "Fornecedores" },
  { key: "materiais", label: "Materiais" },
  { key: "usuarios", label: "Usuários" },
  { key: "empresas", label: "Empresas" },
] as const;

export type ModuloKey = (typeof MODULOS)[number]["key"];

// Módulos sensíveis: ficam desmarcados por padrão ao criar um novo login,
// o admin precisa liberar explicitamente para cada funcionário.
export const MODULOS_SENSIVEIS: ModuloKey[] = [
  "financeiro",
  "rh",
  "usuarios",
  "empresas",
];

export function modulosPadrao(): ModuloKey[] {
  return MODULOS.map((m) => m.key).filter(
    (k) => !MODULOS_SENSIVEIS.includes(k)
  );
}

type UsuarioComPermissao = {
  papel: string;
  modulosVisiveis?: string | null;
} | null;

/**
 * null = usuário nunca teve os módulos customizados (usuários criados antes
 * deste recurso) — mantém o comportamento antigo de acesso total.
 */
function parseModulos(modulosVisiveis: string | null | undefined): Set<string> | null {
  if (modulosVisiveis === null || modulosVisiveis === undefined) return null;
  return new Set(modulosVisiveis.split(",").filter(Boolean));
}

export function podeVerModulo(
  user: UsuarioComPermissao,
  modulo: ModuloKey
): boolean {
  if (!user) return false;
  if (user.papel === "ADMIN") return true;
  const permitidos = parseModulos(user.modulosVisiveis);
  if (permitidos === null) return true;
  return permitidos.has(modulo);
}
