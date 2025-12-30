'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { syllabusAPI } from '@/lib/api';
import { Theme } from '@/lib/api';

export default function BlockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const blockId = params.blockId as string;
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    syllabusAPI.getThemes(blockId)
      .then(setThemes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [blockId]);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-3xl font-bold mt-4">Block {blockId}</h1>
        <p className="text-muted-foreground">Select a theme to practice</p>
      </div>

      {loading ? (
        <p>Loading themes...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <Card key={theme.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{theme.name}</CardTitle>
                <CardDescription>{theme.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push(`/student/blocks/${blockId}/themes/${theme.id}`)}
                  className="w-full"
                >
                  Practice Theme
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

