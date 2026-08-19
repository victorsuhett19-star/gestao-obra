import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { PAPEL_LABEL } from "@/lib/labels";
import { alternarAtivoUsuario } from "@/app/actions/usuarios";

export const metadata: Metadata = {
  title: "Usuários — Gestão de Obra",
};

export default async function UsuariosPage() {
  const user = await getUser();
  const isAdmin = user?.papel === "ADMIN";
  const empresaAtivaId = await getEmpresaAtivaId();

  const usuarios = await prisma.usuario.findMany({
    where: { empresaId: empresaAtivaId ?? undefined },
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-500">
            Pessoas com login no sistema (diferente de Colaboradores, que é a
            equipe de campo sem acesso ao app).
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/usuarios/novo"
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
          >
            + Novo login
          </Link>
        )}
      </div>

      {!isAdmin && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Só administradores podem criar ou editar usuários.
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Função</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr
                key={u.id}
                className={`border-b border-slate-100 last:border-0 ${u.ativo ? "" : "opacity-50"}`}
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {u.nome}
                </td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">
                  {PAPEL_LABEL[u.papel] ?? u.papel}
                </td>
                <td className="px-4 py-3">
                  {isAdmin && (
                    <div className="flex items-center justify-end gap-3 text-xs">
                      <Link
                        href={`/usuarios/${u.id}/editar`}
                        className="font-medium text-slate-600 hover:underline"
                      >
                        Editar
                      </Link>
                      {u.id !== user?.id && (
                        <form action={alternarAtivoUsuario.bind(null, u.id)}>
                          <button
                            type="submit"
                            className="font-medium text-slate-400 hover:underline"
                          >
                            {u.ativo ? "Desativar" : "Ativar"}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
