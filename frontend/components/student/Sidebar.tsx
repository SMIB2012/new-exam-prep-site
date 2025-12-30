'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  BarChart3,
  Bookmark,
  Settings,
  RotateCcw,
} from 'lucide-react';

const studentNavItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/blocks', label: 'Blocks', icon: BookOpen },
  { href: '/student/practice/build', label: 'Practice', icon: PlayCircle },
  { href: '/student/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/student/revision', label: 'Revision', icon: RotateCcw },
  { href: '/student/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/student/settings', label: 'Settings', icon: Settings },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Student Portal</h2>
      <nav className="space-y-1">
        {studentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

