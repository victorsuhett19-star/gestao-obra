import type { Metadata } from "next";
import { TradeWorkspacePage } from "@/components/trade-workspace-page";

export const metadata: Metadata = {
  title: "Vidraçaria — Gestão de Obra",
};

export default function VidracariaPage() {
  return <TradeWorkspacePage trade="VIDRACARIA" emoji="🪟" />;
}
