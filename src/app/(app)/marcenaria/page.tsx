import { redirect } from "next/navigation";

// Marcenaria foi unificada com Projetos, Obras, Marmoraria, Vidraçaria e
// Serralheria numa aba só ("Projetos", com filtro por especialidade).
export default function MarcenariaPage() {
  redirect("/projetos?trade=MARCENARIA");
}
