import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { UsuarioForm } from "../../usuario-form";

export const metadata: Metadata = {
  title: "Editar usuário — Gestão de Obra",
};

export default async function EditarUsuarioPage({
  params,
}: PageProps<"/usuarios/[usuarioId]/editar">) {
  const { usuarioId } = await params;

  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });

  if (!usuario) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Editar usuário
        </h1>
      </div>
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
        <UsuarioForm usuario={usuario} />
      </div>
    </div>
  );
}
