'use client';
import * as React from 'react';
import { Shoutout, ShoutoutFrame } from '@/lib/types';
import { motion } from 'framer-motion';
import { frames } from '@/lib/frames';
import { cn } from '@/lib/utils';

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
            <p className="text-white text-xl font-mono leading-relaxed italic">
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

const UpNextCard = ({ shoutout }: { shoutout: Shoutout }) => {
    const imageUrl = shoutout.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCi_XHvKi-sjiFcWP6UfZCBeKG5Ezja2qJJH8b_HqiF552AtE66-9GjUw0ArTIcirFqn5dTMJFgS-lya3tQP-bfP78XrFPJ9MTwfhqAz-aLfHEuNhH8puxPkpOwiNP4MY8lSi6yMVhl89oKJ0RhoX3oaMQ2eLaB-SVlD5DbRqQ3JRCLB0BLvfdhpZno1Rwr9qou_KFt9NpL2DI33N2Ycq_Dh8QiCi2B1GOhemrYLqXVaTEzo7KN1ghmZPrGioxSS0zl59sd_5Wq1CTC";
    return (
        <div className="w-full bg-[#1a0808] rounded-xl border border-primary/20 p-4 flex flex-col gap-4 shadow-2xl">
            <div 
              className="w-full aspect-video bg-center bg-no-repeat bg-cover rounded-lg overflow-hidden opacity-60" 
              style={{ backgroundImage: `url("${imageUrl}")` }}
              data-alt="Next shoutout image"
            >
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-primary text-xs font-mono">Status: Queued</p>
                <p className="text-white/60 text-sm font-mono leading-tight truncate">"{shoutout.message}"</p>
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

  React.useEffect(() => {
    if (sortedShoutouts.length > 1) {
      const timer = setInterval(() => {
        handleNext();
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [sortedShoutouts.length, handleNext]);

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
  const nextShoutout = sortedShoutouts.length > 1 ? sortedShoutouts[(currentIndex + 1) % sortedShoutouts.length] : null;
  const afterNextShoutout = sortedShoutouts.length > 2 ? sortedShoutouts[(currentIndex + 2) % sortedShoutouts.length] : null;


  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center binary-rain px-4 md:px-12">
        <motion.div 
            key={currentIndex}
            initial={{ opacity: 0.8, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="w-full flex items-center justify-center gap-8 md:gap-16"
        >
            <div className="flex-1 max-w-4xl">
                <div className="flex flex-col items-center mb-6">
                    <h4 className="text-primary text-sm font-bold leading-normal tracking-[0.2em] px-4 py-2 text-center uppercase">Currently Streaming</h4>
                    <div className="h-1 w-24 bg-primary rounded-full blur-[1px]"></div>
                </div>
                {currentShoutout && <MainShoutoutCard shoutout={currentShoutout} frame={currentFrame} />}
            </div>

            {nextShoutout && (
                <div className="w-1/4 flex-col items-center opacity-40 scale-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 hidden lg:flex">
                    <div className="flex flex-col items-center mb-4">
                        <h2 className="text-white tracking-widest text-lg font-bold leading-tight px-4 text-center pb-2 uppercase">Up Next</h2>
                    </div>
                    <UpNextCard shoutout={nextShoutout} />
                    {afterNextShoutout && (
                         <div className="mt-6 w-full bg-[#1a0808]/40 rounded-xl border border-primary/10 p-4 flex flex-col gap-4 scale-90 opacity-40">
                             <p className="text-primary/40 text-xs font-mono truncate">{afterNextShoutout.sender} to {afterNextShoutout.recipient}</p>
                             <p className="text-white/20 text-sm font-mono truncate">"{afterNextShoutout.message}"</p>
                         </div>
                    )}
                </div>
            )}
        </motion.div>

        {sortedShoutouts.length > 1 && (
            <div className="fixed bottom-12 right-12">
                <button onClick={handleNext} className="group flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary text-white gap-3 transition-all hover:bg-red-600 hover:shadow-[0_0_30px_rgba(242,13,13,0.5)]">
                    <span className="truncate text-lg font-bold tracking-wider uppercase font-mono">Next Shout-out</span>
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">arrow_forward</span>
                </button>
            </div>
        )}
        
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
