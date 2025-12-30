'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function CTASection() {
  const router = useRouter();

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Start practicing by your block today.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/signup')}
              className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/login')}
              className="border-slate-300"
            >
              Login
            </Button>
          </div>
          <p className="text-sm text-slate-500">
            No spam. No noise. Just practice.
          </p>
        </div>
      </div>
    </section>
  );
}

