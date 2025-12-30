'use client';

import Link from 'next/link';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Blocks', href: '#blocks' },
    { label: 'FAQ', href: '#faq' },
  ],
  Legal: [
    { label: 'Terms', href: '/legal' },
    { label: 'Privacy', href: '/legal' },
  ],
  Contact: [
    { label: 'Support', href: '/contact' },
    { label: 'Email', href: 'mailto:support@examprep.com' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-semibold text-white">Exam Prep</span>
            </div>
            <p className="text-sm text-slate-400">
              Made for medical students by medical students
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Exam Prep Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

