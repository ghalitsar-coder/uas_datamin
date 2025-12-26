import { cn } from "@/lib/utils";
import { FileText, Hash, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentCardProps {
  index: number;
  filename: string;
  originalPreview: string;
  processedPreview: string;
  wordCount: number;
  className?: string;
  onClick?: () => void;
}

export function DocumentCard({
  index,
  filename,
  originalPreview,
  processedPreview,
  wordCount,
  className,
  onClick,
}: DocumentCardProps) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-border/50 bg-card p-5 shadow-soft card-hover cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{filename}</p>
            <p className="text-xs text-muted-foreground">
              Dokumen #{index + 1}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <Hash className="h-3 w-3" />
          {wordCount} kata
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Teks Asli
          </p>
          <p className="text-sm line-clamp-2 text-foreground/80">
            {originalPreview || "—"}
          </p>
        </div>
        <div className="rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Hasil Stemming
          </p>
          <p className="text-sm line-clamp-2 text-foreground/80">
            {processedPreview || "—"}
          </p>
        </div>
      </div>

      {/* View Detail Button - Appears on Hover */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          Lihat Detail
        </Button>
      </div>
    </div>
  );
}
