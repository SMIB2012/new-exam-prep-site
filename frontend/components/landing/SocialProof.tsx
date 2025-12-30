'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: 'Helped me stop wasting time on random MCQs.',
    author: 'Medical Student',
  },
  {
    quote: 'Block-based practice finally makes sense.',
    author: 'MBBS Year 1',
  },
  {
    quote: 'Review mode is honestly the best part.',
    author: 'Medical Student',
  },
];

export function SocialProof() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="border-slate-200 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-slate-700 mb-4">{testimonial.quote}</p>
                <p className="text-sm text-slate-500">{testimonial.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-slate-500 mt-8">
          Early access feedback (beta)
        </p>
      </div>
    </section>
  );
}

