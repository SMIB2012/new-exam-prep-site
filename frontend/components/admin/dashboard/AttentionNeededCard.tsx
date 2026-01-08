"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export interface AttentionItem {
  id: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

interface AttentionNeededCardProps {
  items: AttentionItem[];
  loading?: boolean;
}

export function AttentionNeededCard({ items, loading }: AttentionNeededCardProps) {
  const router = useRouter();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attention Needed</CardTitle>
        <CardDescription>Items requiring review or action</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex items-center gap-2 py-4 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span>All clear</span>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  {item.actionHref && item.actionLabel && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push(item.actionHref!)}
                    >
                      {item.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
