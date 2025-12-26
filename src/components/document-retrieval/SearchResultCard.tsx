import { cn } from "@/lib/utils";
import { FileText, Hash, Trophy } from "lucide-react";

interface SearchResultCardProps {
  rank: number;
  filename: string;
  similarity: number;
  preview: string;
  wordCount: number;
  className?: string;
  maxScore?: number; // Skor tertinggi untuk normalisasi
}

export function SearchResultCard({
  rank,
  filename,
  similarity,
  preview,
  wordCount,
  className,
  maxScore = 1,
}: SearchResultCardProps) {
  const getRankStyle = (rank: number) => {
    if (rank === 1) return "from-amber-400 to-yellow-500";
    if (rank === 2) return "from-slate-300 to-slate-400";
    if (rank === 3) return "from-amber-600 to-amber-700";
    return "from-primary to-secondary";
  };

  const getRelevanceLevel = (score: number, normalizedScore: number) => {
    // Gunakan normalized score untuk menentukan level
    // Normalized: 100% = paling relevan, 0% = tidak relevan
    if (normalizedScore >= 70)
      return { label: "Sangat Relevan", color: "text-success bg-success/10" };
    if (normalizedScore >= 40)
      return { label: "Cukup Relevan", color: "text-warning bg-warning/10" };
    if (normalizedScore >= 15)
      return { label: "Relevansi Rendah", color: "text-info bg-info/10" };
    return { label: "Tidak Relevan", color: "text-muted-foreground bg-muted" };
  };

  // Normalisasi skor relatif terhadap skor tertinggi (rank 1)
  // Skor tertinggi = 100%, skor lainnya proporsional
  const normalizedScore = maxScore > 0 ? (similarity / maxScore) * 100 : 0;

  const relevance = getRelevanceLevel(similarity, normalizedScore);

  return (
    <div
      className={cn(
        "group rounded-xl border border-border/50 bg-card overflow-hidden shadow-soft card-hover",
        className
      )}
    >
      {/* Gradient top bar */}
      <div className={cn("h-1 bg-gradient-to-r", getRankStyle(rank))} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Rank Badge */}
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md",
                getRankStyle(rank)
              )}
            >
              {rank <= 3 ? (
                <Trophy className="h-6 w-6 text-white" />
              ) : (
                <span className="text-lg font-bold text-white">{rank}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{filename}</p>
              <span
                className={cn(
                  "inline-flex text-xs px-2 py-0.5 rounded-full font-medium",
                  relevance.color
                )}
              >
                {relevance.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium">
            <Hash className="h-3 w-3" />
            {wordCount}
          </div>
        </div>

        {/* Similarity Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Tingkat Kemiripan</span>
            <div className="flex items-center gap-2">
              <span className="font-bold gradient-text">
                {normalizedScore.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                ({(similarity * 100).toFixed(3)}%)
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-700 ease-out"
              style={{ width: `${normalizedScore}%` }}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">
              Cuplikan Dokumen
            </p>
          </div>
          <p className="text-sm line-clamp-3 text-foreground/80">
            {preview || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
