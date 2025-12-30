'use client';

import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ChevronDown } from 'lucide-react';
import gsap from 'gsap';

const steps = [
  {
    number: 1,
    title: 'Choose block/theme',
    description: 'Select your focus area from the syllabus.',
  },
  {
    number: 2,
    title: 'Take a test',
    description: 'Practice in exam-like conditions.',
  },
  {
    number: 3,
    title: 'Review with explanation',
    description: 'Understand mistakes and learn.',
  },
  {
    number: 4,
    title: 'Improve with revision',
    description: 'Targeted practice on weak areas.',
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && cardsRef.current) {
            const cards = Array.from(cardsRef.current.children).filter(
              (el) => el instanceof HTMLElement && el.dataset.card === 'true'
            ) as HTMLElement[];
            
            gsap.fromTo(
              cards,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: 'power3.out',
              }
            );
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
    <section id="how-it-works" ref={sectionRef} className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-slate-600">
            Simple, focused workflow designed for medical students
          </p>
        </div>

        {/* Desktop: Horizontal layout with arrows between cards */}
        <div ref={cardsRef} className="hidden md:grid md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:gap-x-4 lg:gap-x-6 items-center">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <Card 
                data-card="true"
                className="border-slate-200 hover:border-primary transition-colors bg-white h-full min-h-[180px] flex"
              >
                <CardContent className="p-6 flex flex-col justify-between w-full">
                  <div>
                    <Badge className="mb-4 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center p-0 text-sm font-semibold">
                      {step.number}
                    </Badge>
                    <h3 className="font-semibold text-slate-900 mb-2 text-base">{step.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
              {idx < steps.length - 1 && (
                <div className="flex items-center justify-center px-2">
                  <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile/Tablet: Vertical layout with downward chevrons */}
        <div className="md:hidden space-y-6">
          {steps.map((step, idx) => (
            <div key={idx}>
              <Card className="border-slate-200 hover:border-primary transition-colors bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Badge className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center p-0 text-sm font-semibold flex-shrink-0">
                      {step.number}
                    </Badge>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-slate-600">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {idx < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

