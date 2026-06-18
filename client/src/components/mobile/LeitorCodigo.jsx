import { useEffect, useRef, useState } from "react";
import { ScanLine, X } from "lucide-react";

// Leitor de código de barras/QR pela câmera. Usa o BarcodeDetector NATIVO quando
// disponível (sem dependência extra e sem ajuste de CSP). Em aparelhos sem suporte,
// sinaliza para digitar manualmente — o fallback de lib JS (zxing-wasm/qr-scanner)
// fica como melhoria futura (exigiria wasm-unsafe-eval/worker-src blob: na CSP).
// Só acessa câmera/Detector por ação do usuário (nunca no mount).
function suportaBarcodeDetector() {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}

export default function LeitorCodigo({ onResultado }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [lendo, setLendo] = useState(false);
  const [aviso, setAviso] = useState("");

  // Desliga a câmera ao desmontar (ex.: usuário sai de /cadastro-mobile enquanto lê).
  // Sem isso, os MediaStreamTracks ficam ativos (LED aceso / bateria) indefinidamente.
  // Teardown só via ref (sem setState no unmount).
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  function parar() {
    setLendo(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function iniciar() {
    setAviso("");
    if (!suportaBarcodeDetector()) {
      setAviso(
        "Leitura automática não suportada neste aparelho. Digite o código manualmente."
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLendo(true);

      // eslint-disable-next-line no-undef
      const detector = new BarcodeDetector();
      const procurar = async () => {
        if (!streamRef.current || !videoRef.current) return;
        try {
          const codigos = await detector.detect(videoRef.current);
          if (codigos && codigos.length) {
            onResultado?.(codigos[0].rawValue);
            parar();
            return;
          }
        } catch {
          /* quadro sem código legível: tenta o próximo */
        }
        requestAnimationFrame(procurar);
      };
      requestAnimationFrame(procurar);
    } catch {
      setAviso("Não foi possível acessar a câmera.");
      parar();
    }
  }

  return (
    <div>
      {!lendo ? (
        <button
          type="button"
          onClick={iniciar}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 ring-1 ring-white/10 hover:bg-white/20"
        >
          <ScanLine size={16} /> Ler código
        </button>
      ) : (
        <button
          type="button"
          onClick={parar}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600/70 px-4 py-2 text-sm text-white hover:bg-red-600"
        >
          <X size={16} /> Parar leitura
        </button>
      )}
      {lendo && (
        <video
          ref={videoRef}
          className="mt-2 w-full rounded-lg ring-1 ring-white/10"
          muted
          playsInline
        />
      )}
      {aviso && <p className="mt-1 text-xs text-amber-300">{aviso}</p>}
    </div>
  );
}
