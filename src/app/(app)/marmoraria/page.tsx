import type { Metadata } from "next";
import { TradeWorkspacePage } from "@/components/trade-workspace-page";

export const metadata: Metadata = {
  title: "Marmoraria — Gestão de Obra",
};

export default function MarmorariaPage() {
  return <TradeWorkspacePage trade="MARMORARIA" />;
}
