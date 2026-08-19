"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignaturePad } from "./signature-pad";

export function SignatureSection({
  obraId,
  etapaId,
  assinado,
  assinaturaUrl,
}: {
  obraId: string;
  etapaId: string;
  assinado: boolean;
  assinaturaUrl: string | null;
}) {
  const router = useRouter();
  const [jaAssinado, setJaAssinado] = useState(assinado);

  if (jaAssinado) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <p className="text-sm font-medium text-emerald-700">
          ✓ Você confirmou esta etapa
        </p>
        {assinaturaUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={assinaturaUrl}
            alt="Assinatura"
            className="mt-2 h-16 rounded border border-emerald-100 bg-surface"
          />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="mb-2 text-sm font-medium text-slate-700">
        Confirme e assine esta etapa
      </p>
      <SignaturePad
        obraId={obraId}
        etapaId={etapaId}
        onSigned={() => {
          setJaAssinado(true);
          router.refresh();
        }}
      />
    </div>
  );
}
