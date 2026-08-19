import { uploadAnexo } from "@/app/actions/projetos";

export function AnexoUploadForm({ obraId }: { obraId: string }) {
  return (
    <form
      action={uploadAnexo.bind(null, obraId)}
      className="mt-3 flex flex-col gap-2"
    >
      <input
        type="file"
        name="arquivo"
        required
        className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
      />
      <div className="flex items-center gap-2">
        <input
          type="text"
          name="descricao"
          placeholder="Descrição (opcional)"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-700"
        >
          Anexar
        </button>
      </div>
    </form>
  );
}
