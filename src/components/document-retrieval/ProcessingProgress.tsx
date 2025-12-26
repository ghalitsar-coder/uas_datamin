import { cn } from "@/lib/utils";
import { CircularProgress } from "./CircularProgress";
import { FileText, Loader2 } from "lucide-react";

interface UploadProgress {
  current: number;
  total: number;
  filename: string;
  message: string;
}

interface ProcessingProgressProps {
  progress: UploadProgress;
  className?: string;
}

export function ProcessingProgress({ progress, className }: ProcessingProgressProps) {
  const percentage = (progress.current / progress.total) * 100;

  return (
    <div className={cn(
      "rounded-2xl border border-border/50 bg-card p-8 shadow-medium animate-fade-in",
      className
    )}>
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Circular Progress */}
        <div className="relative">
          <CircularProgress progress={percentage} size={140} strokeWidth={10} />
          <div className="absolute inset-0 flex items-center justify-center animate-pulse-soft">
            <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-xl" />
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex-1 text-center lg:text-left space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center justify-center lg:justify-start gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Preprocessing Dokumen
            </h3>
            <p className="text-sm text-muted-foreground">{progress.message}</p>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-center lg:justify-start gap-2">
            {["Reading", "Tokenizing", "Stemming", "Indexing"].map((step, i) => {
              const stepProgress = (progress.current / progress.total) * 4;
              const isActive = stepProgress > i;
              const isCurrent = Math.floor(stepProgress) === i;
              
              return (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full transition-all duration-300",
                      isActive ? "bg-gradient-to-r from-primary to-secondary scale-125" : "bg-muted",
                      isCurrent && "animate-pulse-soft"
                    )}
                  />
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step}
                  </span>
                  {i < 3 && <div className="w-4 h-px bg-border" />}
                </div>
              );
            })}
          </div>

          {/* Current File */}
          <div className="flex items-center justify-center lg:justify-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground animate-float">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">File saat ini</p>
              <p className="font-medium truncate max-w-[200px]">{progress.filename}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="font-bold gradient-text">{progress.current}/{progress.total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
