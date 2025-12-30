'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import gsap from 'gsap';

const blocksByYear = {
  'First Year': ['A', 'B', 'C', 'D', 'E', 'F'],
  'Second Year': ['A', 'B', 'C', 'D', 'E', 'F'],
  'Third Year': ['A', 'B', 'C', 'D', 'E', 'F'],
  'Fourth Year': ['A', 'B', 'C', 'D', 'E', 'F'],
  'Final Year': ['A', 'B', 'C', 'D', 'E', 'F'],
};

const blockNames: Record<string, string> = {
  A: 'Anatomy',
  B: 'Biochemistry',
  C: 'Physiology',
  D: 'Pathology',
  E: 'Pharmacology',
  F: 'Microbiology',
};

export function BlocksSection() {
  const [selectedYear, setSelectedYear] = useState('First Year');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.from(entry.target.children, {
              opacity: 0,
              scale: 0.9,
              duration: 0.5,
              stagger: 0.05,
              ease: 'power2.out',
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="blocks" ref={sectionRef} className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Organized by your syllabus
          </h2>
          <p className="text-lg text-slate-600">
            Practice questions aligned with MBBS block structure
          </p>
        </div>

        <Tabs value={selectedYear} onValueChange={setSelectedYear} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-primary rounded-xl p-1 gap-1">
            {Object.keys(blocksByYear).map((year) => (
              <TabsTrigger 
                key={year} 
                value={year} 
                className="text-sm font-medium rounded-lg px-4 py-2 text-white/90 bg-transparent hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                {year.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(blocksByYear).map(([year, blocks]) => (
            <TabsContent key={year} value={year} className="mt-0">
              <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                {blocks.map((block) => (
                  <Card
                    key={block}
                    className="border-slate-200 hover:border-primary transition-all hover:shadow-md cursor-pointer bg-white"
                  >
                    <CardHeader className="pb-3">
                      <Badge className="w-fit bg-primary text-white">Block {block}</Badge>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg">{blockNames[block]}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {year} curriculum
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

