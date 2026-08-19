"use client";

import { useEffect, useRef, useState } from "react";
import { assinarEtapa } from "@/app/actions/cliente";

export function SignaturePad({
  obraId,
  etapaId,
  onSigned,
}: {
  obraId: string;
  etapaId: string;
  onSigned: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [vazio, setVazio] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function posicao(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function iniciar(e: React.MouseEvent | React.TouchEvent) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawingRef.current = true;
    const { x, y } = posicao(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function mover(e: React.MouseEvent | React.TouchEvent) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = posicao(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setVazio(false);
  }

  function parar() {
    drawingRef.current = false;
  }

  function limpar() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setVazio(true);
    setErro(null);
  }

  async function confirmar() {
    const canvas = canvasRef.current;
    if (!canvas || vazio) return;
    setEnviando(true);
    setErro(null);
    const dataUrl = canvas.toDataURL("image/png");
    const res = await assinarEtapa(obraId, etapaId, dataUrl);
    setEnviando(false);
    if (res?.erro) {
      setErro(res.erro);
      return;
    }
    onSigned();
  }

  return (
    <div className="flex flex-col gap-2">
      <canvas
        ref={canvasRef}
        width={500}
        height={180}
        className="w-full touch-none rounded-lg border border-dashed border-slate-300 bg-white"
        onMouseDown={iniciar}
        onMouseMove={mover}
        onMouseUp={parar}
        onMouseLeave={parar}
        onTouchStart={(e) => {
          e.preventDefault();
          iniciar(e);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          mover(e);
        }}
        onTouchEnd={parar}
      />
      <p className="text-xs text-slate-400">
        Desenhe sua assinatura na área acima com o dedo ou o mouse.
      </p>
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={limpar}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Limpar
        </button>
        <button
          type="button"
          onClick={confirmar}
          disabled={vazio || enviando}
          className="rounded-lg bg-ink-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-ink-700 disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Confirmar assinatura"}
        </button>
      </div>
    </div>
  );
}
