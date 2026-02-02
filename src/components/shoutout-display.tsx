'use client';
import * as React from 'react';
import { Shoutout } from '@/lib/types';
import { frames } from '@/lib/frames';
import ShoutoutCard from './shoutout-card';
import { Skeleton } from './ui/skeleton';
import { HeartCrack } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

type ShoutoutDisplayProps = {
  shoutouts: Shoutout[];
  initialized: boolean;
};

export default function ShoutoutDisplay({ shoutouts, initialized }: ShoutoutDisplayProps) {
  const sortedShoutouts = shoutouts.slice().sort((a, b) => b.createdAt - a.createdAt);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    const onReinit = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    }

    api.on('select', onSelect);
    api.on('reInit', onReinit);

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onReinit);
    }
  }, [api]);

  if (!initialized) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <h2 className="text-2xl font-headline font-semibold mb-4 text-center">Live Feed</h2>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-headline font-semibold mb-8 text-center">Live Feed</h2>
      {sortedShoutouts.length > 0 ? (
        <div className="flex flex-col items-center gap-4">
          <Carousel
            setApi={setApi}
            opts={{
              align: 'center',
              loop: sortedShoutouts.length > 1,
            }}
            className="w-full"
          >
            <CarouselContent>
              {sortedShoutouts.map((shoutout, index) => {
                const isActive = index === current;
                const frame = frames.find((f) => f.id === shoutout.frame);
                return (
                  <CarouselItem key={shoutout.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className={cn("p-1 transition-all duration-300", isActive ? "scale-100" : "scale-75 opacity-50")}>
                      <ShoutoutCard 
                        shoutout={shoutout} 
                        frame={frame}
                        isFeatured={isActive}
                      />
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {sortedShoutouts.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
          <div className="py-2 text-center text-sm text-muted-foreground">
            {count > 0 && `Shoutout ${current + 1} of ${count}`}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg max-w-lg mx-auto">
          <HeartCrack className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold font-headline">No Shoutouts Yet</h3>
          <p className="text-muted-foreground mt-2">Be the first one to send a lovely message!</p>
        </div>
      )}
    </div>
  );
}
