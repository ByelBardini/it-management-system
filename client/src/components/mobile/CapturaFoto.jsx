import { useRef, useState } from "react";
import { Camera } from "lucide-react";

// Captura uma foto do item pela câmera traseira (input file com `capture`). Comprime
// via canvas (~0.7) antes de devolver o File, para a foto caber na fila/quota e subir
// rápido. Devolve um anexo no shape esperado por montarRegistro: { tipo, nome, file }.
async function comprimir(file, maxLado = 1280, qualidade = 0.7) {
  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, largura, altura);
    const blob = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", qualidade)
    );
    if (!blob) return file;
    const nome = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], nome, { type: "image/jpeg" });
  } catch {
    return file; // se a compressão falhar, usa o arquivo original
  }
}

export default function CapturaFoto({ onCapturar }) {
  const inputRef = useRef(null);
  const [processando, setProcessando] = useState(false);

  async function aoSelecionar(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite recapturar/selecionar a mesma foto
    if (!file) return;
    setProcessando(true);
    const comprimido = await comprimir(file);
    setProcessando(false);
    onCapturar?.({ tipo: "imagem", nome: comprimido.name, file: comprimido });
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={aoSelecionar}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processando}
        className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/90 ring-1 ring-white/10 hover:bg-white/20 disabled:opacity-60"
      >
        <Camera size={16} />
        {processando ? "Processando..." : "Tirar foto"}
      </button>
    </div>
  );
}
