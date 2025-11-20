"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TemplateSkeleton() {
  return (
    <div className="h-full">
      <Card className="h-full flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Image skeleton - matches h-48 */}
        <div className="relative h-48 bg-muted overflow-hidden flex items-center justify-center shrink-0">
          <Skeleton className="h-full w-full rounded-none" />
        </div>

        {/* Content area - matches the flex-col grow p-4 structure */}
        <div className="flex flex-col grow p-4">
          {/* Header with title and badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          {/* Description - matches line-clamp-2 */}
          <div className="space-y-1 mb-4 grow">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>

          {/* Footer with price and button */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </Card>
    </div>
  );
}