import { cn } from "@/lib/utils";
import { Search, Sparkles, Tag, FileSearch } from "lucide-react";

interface QueryInfoCardProps {
  queryOriginal: string;
  queryProcessed: string;
  tokens: string[];
  totalResults: number;
  className?: string;
}

export function QueryInfoCard({
  queryOriginal,
  queryProcessed,
  tokens,
  totalResults,
  className,
}: QueryInfoCardProps) {
  return (
    <div className={cn(
      "rounded-2xl border border-border/50 bg-card p-6 shadow-soft animate-fade-in",
      className
    )}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Original Query */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>Query Asli</span>
          </div>
          <p className="font-medium">{queryOriginal}</p>
        </div>

        {/* Processed Query */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Query Diproses</span>
          </div>
          <p className="font-medium">{queryProcessed}</p>
        </div>

        {/* Tokens */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span>Tokens</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tokens.map((token, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20"
              >
                {token}
              </span>
            ))}
          </div>
        </div>

        {/* Total Results */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileSearch className="h-4 w-4" />
            <span>Total Hasil</span>
          </div>
          <p className="text-3xl font-bold gradient-text">{totalResults}</p>
        </div>
      </div>
    </div>
  );
}
