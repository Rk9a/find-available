"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LiveIndicatorProps = {
  loading: boolean;
  shortTerm: string;
};

export function LiveIndicator({ loading, shortTerm }: LiveIndicatorProps) {
  return (
    <Badge
      variant="outline"
      className="mx-auto mb-3 flex h-8 sm:mb-4 gap-2.5 bg-card px-3.5 text-sm font-semibold text-muted-foreground shadow-xs"
    >
      <span
        className={cn(
          "size-2 rounded-full",
          loading
            ? "bg-loading animate-[loadingGlow_1.2s_ease-in-out_infinite]"
            : "bg-live animate-[liveGlow_2s_ease-in-out_infinite]"
        )}
      />

      {loading ? "Loading Semester ···" : `Live · ${shortTerm}`}
    </Badge>
  );
}
