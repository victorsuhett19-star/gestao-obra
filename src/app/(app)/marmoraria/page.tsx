import { redirect } from "next/navigation";

// Marmoraria foi unificada com Projetos, Obras, Marcenaria, Vidraçaria e
// Serralheria numa aba só ("Projetos", com filtro por especialidade).
export default function MarmorariaPage() {
  redirect("/projetos?trade=MARMORARIA");
}
