"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel = "Add", onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <p className="mb-1 text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mb-4 text-xs text-muted-foreground">{description}</p>
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          <Plus className="mr-1 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
