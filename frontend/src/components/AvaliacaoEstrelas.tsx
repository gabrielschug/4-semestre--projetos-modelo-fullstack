import { Star } from "lucide-react";

interface AvaliacaoEstrelasProps {
  media: number | undefined;
}

export function AvaliacaoEstrelas({ media }: AvaliacaoEstrelasProps) {
  if (media === undefined || !Number.isFinite(media)) {
    return null;
  }

  const mediaLimitada = Math.min(5, Math.max(0, media));

  return (
    <div
      className="mb-5 mt-2.5 flex items-center gap-1"
      role="img"
      aria-label={`Avaliação média: ${mediaLimitada.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} de 5 estrelas`}
    >
      <div className="flex items-center" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <Star
            key={estrela}
            className={`h-5 w-5 ${
              estrela <= Math.round(mediaLimitada)
                ? "fill-current text-yellow-300"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
