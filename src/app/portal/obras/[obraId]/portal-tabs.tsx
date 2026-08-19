"use client";

import { useState, type ReactNode } from "react";

export function PortalTabs({
  andamento,
  drive,
}: {
  andamento: ReactNode;
  drive: ReactNode;
}) {
  const [aba, setAba] = useState<"andamento" | "drive">("andamento");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setAba("andamento")}
          className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
            aba === "andamento"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Acompanhamento
        </button>
        <button
          type="button"
          onClick={() => setAba("drive")}
          className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
            aba === "drive"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Drive
        </button>
      </div>

      {aba === "andamento" ? andamento : drive}
    </div>
  );
}
