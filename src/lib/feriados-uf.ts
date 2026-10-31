import { feriadosDoAno } from "@/lib/feriados";

// Datas
// estaduais mais conhecidas de cada UF. Feriados municipais não estão aqui.

export const ESTADOS: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

// [mês, dia, nome]
const FERIADOS_ESTADUAIS: Record<string, [number, number, string][]> = {
  AC: [[1, 23, "Dia do Evangélico"], [6, 15, "Aniversário do Acre"], [9, 5, "Dia da Amazônia"], [11, 17, "Tratado de Petrópolis"]],
  AL: [[6, 24, "São João"], [6, 29, "São Pedro"], [9, 16, "Emancipação Política de Alagoas"], [11, 30, "Dia do Evangélico"]],
  AP: [[3, 19, "São José (padroeiro do Amapá)"], [9, 13, "Criação do Território Federal do Amapá"]],
  AM: [[9, 5, "Elevação do Amazonas à categoria de província"]],
  BA: [[7, 2, "Independência da Bahia"]],
  CE: [[3, 19, "São José"], [3, 25, "Data Magna do Ceará"]],
  DF: [[11, 30, "Dia do Evangélico"]],
  ES: [],
  GO: [],
  MA: [[7, 28, "Adesão do Maranhão à Independência"]],
  MT: [],
  MS: [[10, 11, "Criação do Estado de Mato Grosso do Sul"]],
  MG: [],
  PA: [[8, 15, "Adesão do Grão-Pará à Independência"]],
  PB: [[7, 26, "Homenagem a João Pessoa"], [8, 5, "Fundação do Estado da Paraíba"]],
  PR: [[12, 19, "Emancipação Política do Paraná"]],
  PE: [[3, 6, "Revolução Pernambucana"], [6, 24, "São João"]],
  PI: [[10, 19, "Dia do Piauí"]],
  RJ: [[4, 23, "Dia de São Jorge"]],
  RN: [[10, 3, "Mártires de Cunhaú e Uruaçu"]],
  RS: [[9, 20, "Revolução Farroupilha"]],
  RO: [[1, 4, "Criação do Estado de Rondônia"], [6, 18, "Dia do Evangélico"]],
  RR: [[10, 5, "Criação do Estado de Roraima"]],
  SC: [[8, 11, "Dia de Santa Catarina"]],
  SP: [[7, 9, "Revolução Constitucionalista"]],
  SE: [[7, 8, "Emancipação Política de Sergipe"]],
  TO: [[9, 8, "Nossa Senhora da Natividade"], [10, 5, "Criação do Estado do Tocantins"]],
};

const p2 = (n: number) => String(n).padStart(2, "0");

export type FeriadoDia = { dia: string; nome: string; tipo: "nacional" | "estadual" };

/** Feriados nacionais (de lib/feriados) + as datas estaduais da UF escolhida,
 * com o dia no formato YYYY-MM-DD. */
export function feriadosComUF(ano: number, uf: string | null): FeriadoDia[] {
  const nacionais: FeriadoDia[] = feriadosDoAno(ano).map((f) => ({
    dia: f.data.toISOString().slice(0, 10),
    nome: f.nome,
    tipo: "nacional",
  }));
  const estaduais: FeriadoDia[] = (uf ? (FERIADOS_ESTADUAIS[uf] ?? []) : []).map(
    ([mes, dia, nome]) => ({
      dia: `${ano}-${p2(mes)}-${p2(dia)}`,
      nome: `${nome} (${uf})`,
      tipo: "estadual",
    })
  );
  return [...nacionais, ...estaduais];
}
