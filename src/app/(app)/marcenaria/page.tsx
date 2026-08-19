import type { Metadata } from "next";
import { TradeWorkspacePage } from "@/components/trade-workspace-page";

export const metadata: Metadata = {
  title: "Marcenaria — Gestão de Obra",
};

export default function MarcenariaPage() {
  return <TradeWorkspacePage trade="MARCENARIA" emoji="🪚" />;
}
