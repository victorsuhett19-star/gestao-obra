import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { criarEmpresa, concederAcesso, revogarAcesso } from "@/app/actions/empresa";

export const metadata: Metadata = {
  title: "Empresas — Gestão de Obra",
};

export default async function EmpresasPage() {
  const user = await getUser();
  const isAdmin = user?.papel === "ADMIN";

  const [empresas, usuarios] = await Promise.all([
    prisma.empresa.findMany({
      include: {
        acessos: { include: { usuario: { select: { id: true, nome: true } } } },
        usuarios: { select: { id: true, nome: true } },
      },
      orderBy: { criadoEm: "asc" },
    }),
    prisma.usuario.findMany({
      where: { ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Empresas</h1>
        <p className="text-sm text-slate-500">
          Empresas do grupo e quem tem acesso a cada uma. Use o seletor no
          menu lateral para trocar de empresa ativa.
        </p>
      </div>

      {isAdmin && (
        <form
          action={criarEmpresa}
          className="flex max-w-md items-end gap-2 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="nome" className="text-sm font-medium text-slate-700">
              Nova empresa
            </label>
            <input
              id="nome"
              name="nome"
              placeholder="Nome da empresa"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Criar
          </button>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {empresas.map((empresa) => (
          <div
            key={empresa.id}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-semibold text-slate-900">
              {empresa.nome}
            </p>

            <div className="mt-3 flex flex-col gap-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Usuários com acesso
              </p>
              <div className="flex flex-wrap gap-2">
                {empresa.usuarios.map((u) => (
                  <span
                    key={u.id}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {u.nome} (principal)
                  </span>
                ))}
                {empresa.acessos.map((a) => (
                  <span
                    key={a.id}
                    className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                  >
                    {a.usuario.nome}
                    {isAdmin && (
                      <form action={revogarAcesso.bind(null, a.id)}>
                        <button
                          type="submit"
                          className="ml-1 text-blue-400 hover:text-blue-700"
                          aria-label="Revogar acesso"
                        >
                          ✕
                        </button>
                      </form>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {isAdmin && (
              <form
                action={concederAcesso.bind(null, empresa.id)}
                className="mt-3 flex items-end gap-2"
              >
                <select
                  name="usuarioId"
                  defaultValue=""
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-slate-500"
                >
                  <option value="" disabled>
                    Conceder acesso a...
                  </option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Conceder
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
