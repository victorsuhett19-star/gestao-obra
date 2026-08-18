"use client";

import { useActionState, useState } from "react";
import { saveUsuario } from "@/app/actions/usuarios";
import { PAPEL_USUARIO } from "@/lib/definitions";
import { PAPEL_LABEL } from "@/lib/labels";
import { MODULOS, modulosPadrao, type ModuloKey } from "@/lib/modulos";

type UsuarioInicial = {
  id: string;
  nome: string;
  email: string;
  papel: string;
  modulosVisiveis: string | null;
};

export function UsuarioForm({ usuario }: { usuario?: UsuarioInicial }) {
  const [state, action, pending] = useActionState(saveUsuario, undefined);
  const [papel, setPapel] = useState(usuario?.papel ?? "MESTRE_OBRA");

  // Se o usuário nunca teve os módulos customizados (modulosVisiveis null,
  // caso de logins antigos ou de um usuário novo), começa marcado o padrão
  // (tudo, exceto os módulos sensíveis) para o admin ajustar a partir daí.
  const modulosIniciais: Set<string> =
    usuario && usuario.modulosVisiveis !== null
      ? new Set(usuario.modulosVisiveis.split(",").filter(Boolean))
      : new Set(modulosPadrao());

  return (
    <form action={action} className="flex flex-col gap-4">
      {usuario && <input type="hidden" name="usuarioId" value={usuario.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={usuario?.nome}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.nome && (
          <p className="text-sm text-red-600">{state.errors.nome[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          E-mail (usado para login)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={usuario?.email}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.email && (
          <p className="text-sm text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="papel" className="text-sm font-medium text-slate-700">
          Função
        </label>
        <select
          id="papel"
          name="papel"
          value={papel}
          onChange={(e) => setPapel(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          {PAPEL_USUARIO.map((p) => (
            <option key={p} value={p}>
              {PAPEL_LABEL[p]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-sm font-medium text-slate-700">
          {usuario ? "Nova senha (opcional)" : "Senha"}
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          placeholder={usuario ? "Deixe em branco para manter a atual" : "Mínimo 6 caracteres"}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.senha && (
          <p className="text-sm text-red-600">{state.errors.senha[0]}</p>
        )}
      </div>

      {papel === "ADMIN" ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
          Administradores sempre têm acesso a todos os módulos do sistema.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-slate-700">
            O que esta pessoa pode visualizar
          </p>
          <p className="text-xs text-slate-500">
            Módulos com informações sensíveis (Financeiro, RH, Usuários,
            Empresas) começam desmarcados — libere só para quem precisar.
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-3">
            {MODULOS.map((m) => (
              <label
                key={m.key}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  name="modulos"
                  value={m.key}
                  defaultChecked={modulosIniciais.has(m.key as ModuloKey)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                {m.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {state?.message && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {pending
            ? "Salvando..."
            : usuario
              ? "Salvar alterações"
              : "Criar login"}
        </button>
      </div>
    </form>
  );
}
