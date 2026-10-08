import { Star } from "lucide-react";

interface AvaliacaoEstrelasProps {
  media: number | undefined;
  compact?: boolean;
}

export function AvaliacaoEstrelas({
  media,
  compact = false,
}: AvaliacaoEstrelasProps) {
  if (media === undefined || !Number.isFinite(media)) {
    return null;
  }

  const mediaLimitada = Math.min(5, Math.max(0, media));

  return (
    <div
      className={`flex items-center gap-1 ${
        compact ? "my-2" : "mb-5 mt-2.5"
      }`}
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
            className={`${compact ? "h-4 w-4" : "h-5 w-5"} ${
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
