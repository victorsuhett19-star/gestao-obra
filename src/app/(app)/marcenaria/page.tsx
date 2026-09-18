import type { Metadata } from "next";
import { TradeWorkspacePage } from "@/components/trade-workspace-page";

export const metadata: Metadata = {
  title: "Marcenaria — VS Gestão de Obra",
};

export default function MarcenariaPage() {
  return <TradeWorkspacePage trade="MARCENARIA" />;
}
