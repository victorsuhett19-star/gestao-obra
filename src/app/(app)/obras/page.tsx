import { redirect } from "next/navigation";

// A listagem de Obras foi unificada com Projetos, Marcenaria, Marmoraria,
// Vidraçaria e Serralheria numa aba só ("Projetos", com filtro por
// especialidade). Mantém esse endereço funcionando como redirect pra não
// quebrar links salvos.
export default function ObrasPage() {
  redirect("/projetos");
}
