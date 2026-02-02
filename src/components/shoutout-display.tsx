'use client';
import * as React from 'react';
import { Shoutout } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { ArrowRight, HeartCrack } from 'lucide-react';
import ShoutoutStreamCard from './shoutout-stream-card';
import ShoutoutNextCard from './shoutout-next-card';
import { AnimatePresence, motion } from 'framer-motion';

type ShoutoutDisplayProps = {
  shoutouts: Shoutout[];
  initialized: boolean;
};

export default function ShoutoutDisplay({ shoutouts, initialized }: ShoutoutDisplayProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const sortedShoutouts = shoutouts.slice().sort((a, b) => b.createdAt - a.createdAt);

  const handleNext = React.useCallback(() => {
    if (sortedShoutouts.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % sortedShoutouts.length);
    }
  }, [sortedShoutouts.length]);

  React.useEffect(() => {
    if (sortedShoutouts.length > 1) {
      const timer = setInterval(() => {
        handleNext();
      }, 15000); // Auto-advance every 15 seconds
      return () => clearInterval(timer);
    }
  }, [sortedShoutouts.length, handleNext]);

  if (!initialized) {
    return <Skeleton className="w-full max-w-4xl h-[400px] bg-white/10" />;
  }
  
  if (sortedShoutouts.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-10 font-code">
          <HeartCrack className="w-24 h-24 text-primary/50 mb-6" />
          <h3 className="text-2xl font-semibold font-headline">Awaiting Transmissions...</h3>
          <p className="text-muted-foreground mt-2 text-lg">Create a shoutout to get the stream started!</p>
        </div>
    );
  }
  
  const currentShoutout = sortedShoutouts[currentIndex];
  const nextShoutout = sortedShoutouts.length > 1 ? sortedShoutouts[(currentIndex + 1) % sortedShoutouts.length] : null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative font-code p-4">
      <div className="absolute top-4 md:top-10 text-center">
        <h2 className="text-primary uppercase tracking-[0.2em] text-sm">Currently Streaming</h2>
        <div className="w-24 h-px bg-primary/50 mx-auto mt-2"></div>
      </div>

      <div className="w-full max-w-4xl my-auto">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentShoutout.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5 }}
            >
                <ShoutoutStreamCard shoutout={currentShoutout} />
            </motion.div>
        </AnimatePresence>
      </div>
      
      {nextShoutout && (
        <div className="absolute bottom-28 right-4 md:right-10 w-48 md:w-64 hidden md:block">
           <h3 className="text-primary/70 uppercase tracking-[0.2em] text-xs mb-2">Up Next</h3>
           <div className="opacity-50">
             <ShoutoutNextCard shoutout={nextShoutout} />
           </div>
        </div>
      )}

      {sortedShoutouts.length > 1 && (
         <Button onClick={handleNext} className="absolute bottom-6 right-4 md:bottom-10 md:right-10 rounded-md h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-sm">
            Next Shout-Out <ArrowRight className="ml-2 h-5 w-5"/>
         </Button>
      )}
    </div>
  );
}
