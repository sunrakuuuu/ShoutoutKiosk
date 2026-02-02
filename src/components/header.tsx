'use client';
import { Heart, Code, PenSquare, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Feed', icon: LayoutGrid },
    { href: '/create', label: 'Create', icon: PenSquare },
  ];

  return (
    <header className="py-6 border-b border-white/10">
      <div className="container mx-auto flex flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-4">
          <Heart className="text-primary w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-center tracking-tighter">
            CCS Valentine <span className="text-primary">Shoutout</span>
          </h1>
          <Code className="text-accent w-8 h-8" />
        </div>
        <div className="flex items-center gap-6">
            <nav className="flex gap-6">
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className={cn(
                    'flex items-center gap-2 text-md font-medium transition-colors',
                    pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )}
                >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
                </Link>
            ))}
            </nav>
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
