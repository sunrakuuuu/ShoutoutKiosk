'use client';
import * as React from 'react';
import { Shoutout, ShoutoutFrame } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { frames } from '@/lib/frames';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ShoutoutDisplayProps = {
  shoutouts: Shoutout[];
  initialized: boolean;
};

const MainShoutoutCard = ({ shoutout, frame }: { shoutout: Shoutout; frame: ShoutoutFrame | undefined }) => {
  const imageUrl = shoutout.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCZCAL9woq7nJGc8C4QG3Td0rcexod38wbfCj8bpe_X1w-P52NufLP5z0DzS2WqoKJBpYgnJWvYGoSf6d3jwqAIhT5MRnILvF1YHRJO3N1eN-TyNY4jgLE8awVBX7PuRiDNFsiHjhSa_hU1VzVIx6nqGrIPpjIG1WwoBRJ4BEn0cmPuvb02SArHWfZ9nuurDWUGJABPLs7MFnT5bVR0chL5BzNMhV-oI0hM1-QuSjIgraV3glFeHZAlxa4zyV8h3H0oUkhVTxKWWX_x";
  return (
    <div className={cn(frame?.className, "bg-black/40 backdrop-blur-md rounded-xl p-8 transition-all duration-700")}>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div 
          className="w-full md:w-1/2 aspect-square bg-center bg-no-repeat bg-cover rounded-lg border-2 border-primary/30"
          style={{ backgroundImage: `url("${imageUrl}")` }}
          data-alt="Shoutout image"
        >
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <div className="space-y-1">
            <p className="text-primary/70 font-mono text-sm uppercase tracking-tighter">&lt;Sender&gt;</p>
            <p className="text-white text-2xl font-bold font-mono">{shoutout.sender}</p>
          </div>
          <div className="space-y-1">
            <p className="text-primary/70 font-mono text-sm uppercase tracking-tighter">&lt;Recipient&gt;</p>
            <p className="text-white text-3xl font-bold font-mono text-primary">To: {shoutout.recipient}</p>
          </div>
          <div className="mt-4 p-4 border-l-4 border-primary bg-primary/10">
            <p className="text-white text-3xl font-mono leading-snug italic">
              "{shoutout.message}"
            </p>
          </div>
          <div className="flex justify-start pt-4">
            <div className="flex items-center gap-2 text-primary font-mono text-xs">
              <span className="material-symbols-outlined text-sm">favorite</span>
              <span>SYSTEM_READY: 200 OK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ShoutoutDisplay({ shoutouts, initialized }: ShoutoutDisplayProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const sortedShoutouts = shoutouts.slice().sort((a, b) => b.createdAt - a.createdAt);

  const handleNext = React.useCallback(() => {
    if (sortedShoutouts.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % sortedShoutouts.length);
    }
  }, [sortedShoutouts.length]);

  const handlePrev = React.useCallback(() => {
    if (sortedShoutouts.length > 0) {
        setCurrentIndex((prev) => (prev - 1 + sortedShoutouts.length) % sortedShoutouts.length);
    }
  }, [sortedShoutouts.length]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNext, handlePrev]);

  if (!initialized) {
    return (
        <div className="relative min-h-screen w-full flex flex-col justify-center items-center binary-rain">
            <div className="text-primary animate-pulse font-mono text-lg">Loading Transmissions...</div>
        </div>
    );
  }
  
  if (sortedShoutouts.length === 0) {
    return (
      <div className="relative min-h-screen w-full flex flex-col justify-center items-center binary-rain">
        <div className="flex flex-col items-center justify-center text-center font-mono">
          <span className="material-symbols-outlined text-primary/50 !text-7xl mb-6">portable_wifi_off</span>
          <h3 className="text-2xl font-semibold font-display">Awaiting Transmissions...</h3>
          <p className="text-white/60 mt-2 text-lg">Create a shoutout to get the stream started!</p>
        </div>
      </div>
    );
  }
  
  const currentShoutout = sortedShoutouts[currentIndex];
  const currentFrame = frames.find((f) => f.id === currentShoutout?.frame);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-start items-center binary-rain px-4 md:px-12 sm:pt-8 overflow-hidden">
      {sortedShoutouts.length > 1 && (
        <>
          <button onClick={handlePrev} className="absolute left-4 md:left-16 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 text-white/50 hover:bg-primary hover:text-white transition-colors">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button onClick={handleNext} className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 text-white/50 hover:bg-primary hover:text-white transition-colors">
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -200 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full flex items-center justify-center"
        >
            <div className="flex-1 max-w-4xl">
                <div className="flex flex-col items-center mb-4">
                    <h4 className="text-primary text-sm font-bold leading-normal tracking-[0.2em] px-4 py-2 text-center uppercase">Currently Streaming</h4>
                    <div className="h-1 w-24 bg-primary rounded-full blur-[1px]"></div>
                </div>
                {currentShoutout && <MainShoutoutCard shoutout={currentShoutout} frame={currentFrame} />}
            </div>
        </motion.div>
      </AnimatePresence>
        
        <div className="fixed bottom-6 left-12">
            <div className="flex items-center gap-4 text-primary/30 font-mono text-xs">
                <span>COM_DEPT_TERMINAL</span>
                <span className="h-1 w-1 rounded-full bg-primary/30"></span>
                <span>ID: VALENTINE-2024-X</span>
                <span className="h-1 w-1 rounded-full bg-primary/30"></span>
                <span className="animate-pulse">_LISTENING_FOR_INPUT</span>
            </div>
        </div>
    </div>
  );
}
