'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

interface AuthLayoutProps {
  children: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function AuthLayout({ children, rightPanel }: AuthLayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (contentRef.current) {
      const children = Array.from(contentRef.current.children) as HTMLElement[];
      gsap.fromTo(
        children,
        { y: 12, opacity: 1 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Top Bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-semibold text-slate-900">Exam Prep</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div ref={contentRef} className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Auth Card */}
          <div className="w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[420px]">
              {children}
            </div>
          </div>

          {/* Right: Value Panel (Desktop only) */}
          <div className="hidden lg:block">
            <div className="max-w-md">
              {rightPanel}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white/50 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center gap-6 text-sm text-slate-600">
            <Link href="/legal" className="hover:text-slate-900 transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/legal" className="hover:text-slate-900 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

