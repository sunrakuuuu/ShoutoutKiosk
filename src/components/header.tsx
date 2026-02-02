'use client';
import { Heart, Code, PenSquare, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Create', icon: PenSquare },
    { href: '/shoutouts', label: 'Feed', icon: LayoutGrid },
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
        <nav className="flex gap-2 p-1 bg-muted rounded-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-background shadow text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
