'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SignupRightPanel() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-900">
        What you get
      </h3>
      <ul className="space-y-4">
        <li className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <span className="text-slate-700">Block-based practice</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <span className="text-slate-700">Exam-like test environment</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <span className="text-slate-700">Clear review & insights</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <span className="text-slate-700">Built for medical students</span>
        </li>
      </ul>
      
      <div className="pt-6 border-t border-slate-200">
        <p className="text-sm font-semibold text-slate-700 mb-3">Coming soon</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Adaptive practice</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Deeper analytics</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

