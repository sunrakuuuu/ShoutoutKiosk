'use client';
import Header from '@/components/header';
import ShoutoutForm from '@/components/shoutout-form';
import { useShoutouts } from '@/hooks/use-shoutouts';
import ShoutoutCard from '@/components/shoutout-card';
import { frames } from '@/lib/frames';
import { Skeleton } from '@/components/ui/skeleton';
import { HeartCrack } from 'lucide-react';

export default function CreatePage() {
  const { shoutouts, addShoutout, deleteShoutout, initialized } = useShoutouts();
  const sortedShoutouts = [...shoutouts].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="w-full max-w-lg mx-auto md:mx-0">
                <ShoutoutForm onAddShoutout={addShoutout} />
            </div>
            <div className="w-full">
            <h2 className="text-2xl font-headline font-semibold mb-4">Manage Shoutouts</h2>
            {!initialized ? (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : sortedShoutouts.length > 0 ? (
                <div className="space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
                {sortedShoutouts.map((shoutout) => {
                    const frame = frames.find((f) => f.id === shoutout.frame);
                    return <ShoutoutCard key={shoutout.id} shoutout={shoutout} frame={frame} onDelete={deleteShoutout} showActions={true} />;
                })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
                    <HeartCrack className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold font-headline">No Shoutouts Yet</h3>
                    <p className="text-muted-foreground mt-2">Create a shoutout to get started!</p>
                </div>
            )}
            </div>
        </div>
      </main>
      <footer className="text-center py-4 text-muted-foreground text-sm">
        <p>Made with ❤️ by and for the CCS Community.</p>
      </footer>
    </div>
  );
}
