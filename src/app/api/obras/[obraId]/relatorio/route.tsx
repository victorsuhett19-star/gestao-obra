import { NextResponse } from "next/server";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/session";
import { STATUS_OBRA_LABEL, CLIMA_LABEL, formatDateOnly, formatDate } from "@/lib/labels";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  h1: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#64748b", marginBottom: 16 },
  section: { marginBottom: 16 },
  h2: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    borderBottom: "1 solid #cbd5e1",
    paddingBottom: 3,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 130, color: "#64748b" },
  value: { flex: 1 },
  entry: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: "1 solid #e2e8f0",
  },
  entryHeader: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  entryMeta: { color: "#64748b", fontSize: 9, marginBottom: 2 },
  empty: { color: "#94a3b8", fontStyle: "italic" },
});

function fmt(date: Date | null) {
  return date ? formatDateOnly(date) : "—";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ obraId: string }> }
) {
  const { obraId } = await params;

  const staffSession = await getSessionPayload();
  if (!staffSession?.userId) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: {
      trades: true,
      comentarios: {
        orderBy: { criadoEm: "desc" },
        include: { autorUsuario: true, autorCliente: true },
      },
      diarios: {
        orderBy: { data: "desc" },
        include: { colaboradores: { include: { colaborador: true } } },
      },
    },
  });

  if (!obra) {
    return new NextResponse("Obra não encontrada", { status: 404 });
  }

  const geradoEm = formatDate(new Date());

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{obra.nome}</Text>
        <Text style={styles.subtitle}>
          Relatório gerado em {geradoEm} — {STATUS_OBRA_LABEL[obra.status]}
        </Text>

        <View style={styles.section}>
          <Text style={styles.h2}>Dados do projeto</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{obra.clienteNome ?? "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.value}>{obra.clienteTelefone ?? "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.value}>{obra.clienteEmail ?? "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Endereço</Text>
            <Text style={styles.value}>{obra.endereco ?? "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Especialidades</Text>
            <Text style={styles.value}>
              {obra.trades.length > 0
                ? obra.trades.map((t) => t.trade).join(", ")
                : "—"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Início previsto / real</Text>
            <Text style={styles.value}>
              {fmt(obra.dataInicioPrevista)} / {fmt(obra.dataInicioReal)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fim previsto / real</Text>
            <Text style={styles.value}>
              {fmt(obra.dataFimPrevista)} / {fmt(obra.dataFimReal)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Comentários</Text>
          {obra.comentarios.length === 0 ? (
            <Text style={styles.empty}>Nenhum comentário registrado.</Text>
          ) : (
            obra.comentarios.map((c) => (
              <View key={c.id} style={styles.entry}>
                <Text style={styles.entryMeta}>
                  {(c.autorUsuario?.nome ?? c.autorCliente?.nome ?? "Equipe")} ·{" "}
                  {formatDate(c.criadoEm)}
                </Text>
                <Text>{c.texto}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Diário de obra</Text>
          {obra.diarios.length === 0 ? (
            <Text style={styles.empty}>Nenhum registro de diário.</Text>
          ) : (
            obra.diarios.map((d) => (
              <View key={d.id} style={styles.entry}>
                <Text style={styles.entryHeader}>{fmt(d.data)}</Text>
                <Text style={styles.entryMeta}>
                  {d.clima ? `Clima: ${CLIMA_LABEL[d.clima]}` : ""}
                  {d.colaboradores.length > 0 &&
                    ` · Presentes: ${d.colaboradores.map((c) => c.colaborador.nome).join(", ")}`}
                </Text>
                <Text>{d.atividadesRealizadas}</Text>
                {d.necessidades && (
                  <Text style={{ marginTop: 2, color: "#64748b" }}>
                    Necessidades: {d.necessidades}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(doc);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="relatorio-${obra.nome.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
