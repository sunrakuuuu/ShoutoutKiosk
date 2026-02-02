'use client';
import Header from '@/components/header';
import ShoutoutDisplay from '@/components/shoutout-display';
import { useShoutouts } from '@/hooks/use-shoutouts';

export default function ShoutoutsPage() {
  const { shoutouts, initialized } = useShoutouts();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ShoutoutDisplay shoutouts={shoutouts} initialized={initialized} />
      </main>
      <footer className="text-center py-4 text-muted-foreground text-sm">
        <p>Made with ❤️ by and for the CCS Community.</p>
      </footer>
    </div>
  );
}
