// Feriados nacionais brasileiros, calculados pra qualquer ano — sem precisar
// de tabela no banco. Fixos (data igual todo ano) + móveis (dependem da
// Páscoa, calculada pelo algoritmo de Gauss).

function calcularPascoa(ano: number): Date {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function adicionarDias(data: Date, dias: number): Date {
  const d = new Date(data);
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

export type Feriado = { data: Date; nome: string };

export function feriadosDoAno(ano: number): Feriado[] {
  const pascoa = calcularPascoa(ano);

  return [
    { data: new Date(Date.UTC(ano, 0, 1)), nome: "Confraternização Universal" },
    { data: adicionarDias(pascoa, -47), nome: "Carnaval" },
    { data: adicionarDias(pascoa, -46), nome: "Quarta-feira de Cinzas" },
    { data: adicionarDias(pascoa, -2), nome: "Sexta-feira Santa" },
    { data: pascoa, nome: "Páscoa" },
    { data: new Date(Date.UTC(ano, 3, 21)), nome: "Tiradentes" },
    { data: new Date(Date.UTC(ano, 4, 1)), nome: "Dia do Trabalho" },
    { data: adicionarDias(pascoa, 60), nome: "Corpus Christi" },
    { data: new Date(Date.UTC(ano, 8, 7)), nome: "Independência do Brasil" },
    { data: new Date(Date.UTC(ano, 9, 12)), nome: "Nossa Senhora Aparecida" },
    { data: new Date(Date.UTC(ano, 10, 2)), nome: "Finados" },
    { data: new Date(Date.UTC(ano, 10, 15)), nome: "Proclamação da República" },
    { data: new Date(Date.UTC(ano, 10, 20)), nome: "Consciência Negra" },
    { data: new Date(Date.UTC(ano, 11, 25)), nome: "Natal" },
  ];
}

export function feriadoNoDia(data: Date, feriados: Feriado[]): Feriado | undefined {
  return feriados.find(
    (f) =>
      f.data.getUTCFullYear() === data.getUTCFullYear() &&
      f.data.getUTCMonth() === data.getUTCMonth() &&
      f.data.getUTCDate() === data.getUTCDate()
  );
}
