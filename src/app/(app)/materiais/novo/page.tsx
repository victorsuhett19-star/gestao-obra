import type { Metadata } from "next";
import { MaterialForm } from "../material-form";

export const metadata: Metadata = {
  title: "Novo material — Gestão de Obra",
};

export default function NovoMaterialPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Novo material</h1>
      </div>
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
        <MaterialForm />
      </div>
    </div>
  );
}
