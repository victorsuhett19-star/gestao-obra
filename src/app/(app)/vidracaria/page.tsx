import { redirect } from "next/navigation";

// Vidraçaria foi unificada com Projetos, Obras, Marcenaria, Marmoraria e
// Serralheria numa aba só ("Projetos", com filtro por especialidade).
export default function VidracariaPage() {
  redirect("/projetos?trade=VIDRACARIA");
}
