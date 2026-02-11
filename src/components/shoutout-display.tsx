"use client";
import * as React from "react";
import { Shoutout, ShoutoutFrame } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { frames } from "@/lib/frames";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import FloatingHearts from "./FloatingHearts";
import SparkleRain from "./SparkleRain";
import ReactionAnimation from "./ReactionAnimation";

type ReactionType = "heart" | "flame" | "chocolate";

type ShoutoutDisplayProps = {
  shoutouts: Shoutout[];
  initialized: boolean;
};

const MainShoutoutCard = ({
  shoutout,
  frame,
}: {
  shoutout: Shoutout;
  frame: ShoutoutFrame | undefined;
}) => {
  const imageUrl =
    shoutout.image ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCZCAL9woq7nJGc8C4QG3Td0rcexod38wbfCj8bpe_X1w-P52NufLP5z0DzS2WqoKJBpYgnJWvYGoSf6d3jwqAIhT5MRnILvF1YHRJO3N1eN-TyNY4jgLE8awVBX7PuRiDNFsiHjhSa_hU1VzVIx6nqGrIPpjIG1WwoBRJ4BEn0cmPuvb02SArHWfZ9nuurDWUGJABPLs7MFnT5bVR0chL5BzNMhV-oI0hM1-QuSjIgraV3glFeHZAlxa4zyV8h3H0oUkhVTxKWWX_x";

  const charCount = shoutout.message.length;

  return (
    <div
      className={cn(
        frame?.className,
        "bg-card/80 backdrop-blur-md rounded-xl p-4 md:p-8 transition-all duration-700 w-full",
      )}
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
        <div className="w-full md:w-1/2">
          <div
            className="aspect-square bg-center bg-no-repeat bg-cover rounded-lg border-2 border-primary/30 min-h-[250px] md:min-h-0 w-full"
            style={{ backgroundImage: `url("${imageUrl}")` }}
            data-alt="Shoutout image"
          />
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-4 md:gap-6">
          <div className="space-y-1">
            <p className="text-primary/70 font-mono text-xs md:text-sm uppercase tracking-tighter">
              &lt;Sender&gt;
            </p>
            <p className="text-foreground text-xl md:text-2xl font-bold font-mono truncate">
              {shoutout.senderName}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-primary/70 font-mono text-xs md:text-sm uppercase tracking-tighter">
              &lt;Recipient&gt;
            </p>
            <p className="text-primary text-2xl md:text-3xl font-bold font-mono truncate">
              To: {shoutout.recipientName}
            </p>
          </div>

          <div className="mt-2 md:mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-primary/60 font-mono text-xs uppercase tracking-wider">
                &lt;Message&gt;
              </p>
              <span className="text-xs font-mono text-primary/50">
                {charCount}/200
              </span>
            </div>

            <div className="p-4 md:p-5 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(120,119,198,0.2)_1px,transparent_0)] bg-[length:20px_20px]"></div>
              </div>
              <p className="text-foreground font-mono leading-relaxed md:leading-snug italic relative z-10 break-words text-base md:text-lg min-h-[100px] md:min-h-[120px] flex items-center">
                "{shoutout.message}"
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 md:pt-4">
            <div className="flex items-center gap-2 text-primary font-mono text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs md:text-sm">LIVE</span>
              </div>
              <span>•</span>
              <span className="text-xs md:text-sm">200_CHAR_MAX</span>
            </div>
            <div className="text-primary/50 font-mono text-xs">
              SYSTEM_READY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ShoutoutDisplay({
  shoutouts,
  initialized,
}: ShoutoutDisplayProps) {
  const [displayShoutouts, setDisplayShoutouts] = React.useState<Shoutout[]>(
    [],
  );
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [reactionTrigger, setReactionTrigger] = React.useState<{
    type: ReactionType;
    count: number;
  } | null>(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [pendingShoutout, setPendingShoutout] = React.useState<Shoutout | null>(
    null,
  );

  // Initialize display shoutouts
  React.useEffect(() => {
    if (shoutouts.length > 0) {
      const sorted = shoutouts
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt);
      setDisplayShoutouts(sorted);
      if (currentIndex === 0 && displayShoutouts.length === 0) {
        setCurrentIndex(0);
      }
    }
  }, [shoutouts]);

  // Detect new shoutouts
  React.useEffect(() => {
    if (shoutouts.length > displayShoutouts.length) {
      const newOnes = shoutouts.filter(
        (shoutout) => !displayShoutouts.some((d) => d.id === shoutout.id),
      );

      if (newOnes.length > 0) {
        // Get the newest one
        const newest = newOnes.sort((a, b) => b.createdAt - a.createdAt)[0];
        setPendingShoutout(newest);
      }
    }
  }, [shoutouts, displayShoutouts]);

  // Handle 10-second delay for new shoutout
  React.useEffect(() => {
    if (isPaused) return;
    if (!pendingShoutout) return;

    const timer = setTimeout(() => {
      // Insert the new shoutout at the beginning
      setDisplayShoutouts((prev) => [pendingShoutout!, ...prev]);

      // Adjust current index: if we were at 0, stay at 0 (now showing new one)
      // if we were at any other index, increase by 1 to keep showing same content
      setCurrentIndex((prev) => (prev === 0 ? 0 : prev + 1));

      setPendingShoutout(null);
    }, 10000);

    return () => clearTimeout(timer);
  }, [pendingShoutout, isPaused]);

  const handleNext = React.useCallback(() => {
    if (displayShoutouts.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % displayShoutouts.length);
    }
  }, [displayShoutouts.length]);

  const handlePrev = React.useCallback(() => {
    if (displayShoutouts.length > 0) {
      setCurrentIndex(
        (prev) =>
          (prev - 1 + displayShoutouts.length) % displayShoutouts.length,
      );
    }
  }, [displayShoutouts.length]);

  const handleReaction = (type: ReactionType) => {
    setReactionTrigger({ type, count: Date.now() });
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Auto-slide every 10 seconds
  React.useEffect(() => {
    if (isPaused) return;
    if (displayShoutouts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayShoutouts.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isPaused, displayShoutouts.length]);

  if (!initialized) {
    return (
      <div className="relative min-h-screen w-full flex flex-col justify-center items-center p-4">
        <SparkleRain />
        <div className="text-primary animate-pulse font-mono text-base md:text-lg">
          Loading Transmissions...
        </div>
      </div>
    );
  }

  if (displayShoutouts.length === 0) {
    return (
      <div className="relative min-h-screen w-full flex flex-col justify-center items-center p-4">
        <SparkleRain />
        <div className="flex flex-col items-center justify-center text-center font-mono px-4">
          <div className="relative mb-4 md:mb-6">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary/50 text-3xl md:text-4xl">
                chat
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs md:text-sm">0</span>
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-semibold font-display">
            Transmission Buffer Empty
          </h3>
          <p className="text-muted-foreground mt-2 text-base md:text-lg max-w-md">
            Send the first shoutout to initiate the broadcast stream
          </p>
        </div>
      </div>
    );
  }

  const currentShoutout = displayShoutouts[currentIndex];
  const currentFrame = frames.find((f) => f.id === currentShoutout?.frame);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-start items-center px-3 md:px-12 pt-8 md:pt-12 pb-20 md:pb-24 overflow-hidden">
      <FloatingHearts />
      <SparkleRain />
      <ReactionAnimation trigger={reactionTrigger} />

      {/* Navigation Arrows */}
      {displayShoutouts.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 md:left-4 lg:left-16 top-1/2 -translate-y-1/2 z-10 p-1.5 md:p-2 rounded-full bg-card/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 md:right-4 lg:right-16 top-1/2 -translate-y-1/2 z-10 p-1.5 md:p-2 rounded-full bg-card/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full flex items-center justify-center px-2"
        >
          <div className="flex-1 max-w-5xl">
            <div className="flex flex-col items-center mb-6 md:mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h4 className="text-primary text-xs md:text-sm font-bold leading-normal tracking-[0.3em] px-3 md:px-4 py-1.5 md:py-2 text-center uppercase">
                  Currently Streaming
                </h4>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              <div className="h-0.5 w-32 md:w-40 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
            </div>

            {currentShoutout && (
              <MainShoutoutCard
                shoutout={currentShoutout}
                frame={currentFrame}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls Bar */}
      {displayShoutouts.length > 0 && (
        <div className="fixed bottom-4 md:bottom-6 inset-x-0 flex justify-center items-center z-10 px-4">
          <div className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl bg-card/60 text-foreground font-mono text-xs md:text-sm backdrop-blur-xl border border-primary/10 flex items-center gap-4 md:gap-6 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-primary font-semibold">
                {currentIndex + 1}
              </span>
              <span className="text-muted-foreground">of</span>
              <span className="text-primary font-semibold">
                {displayShoutouts.length}
              </span>
            </div>

            <div className="h-4 w-px bg-primary/20"></div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-primary/20 transition-all hover:scale-110"
              title={isPaused ? "Resume auto-play" : "Pause auto-play"}
            >
              {isPaused ? (
                <Play className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Pause className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>

            <div className="h-4 w-px bg-primary/20"></div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">AUTO:</div>
              <div
                className={`w-2 h-2 rounded-full ${isPaused ? "bg-red-500" : "bg-green-500 animate-pulse"}`}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Reaction Buttons */}
      <div className="fixed bottom-16 md:bottom-20 right-3 md:right-6 flex flex-row gap-2 md:gap-3 z-20">
        <button
          onClick={() => handleReaction("heart")}
          className="p-2.5 md:p-3 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-xl text-xl md:text-2xl hover:from-pink-500/30 hover:to-rose-500/30 transition-all hover:scale-110 shadow-lg border border-pink-500/30"
        >
          ❤️
        </button>
        <button
          onClick={() => handleReaction("flame")}
          className="p-2.5 md:p-3 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl text-xl md:text-2xl hover:from-orange-500/30 hover:to-red-500/30 transition-all hover:scale-110 shadow-lg border border-orange-500/30"
        >
          🔥
        </button>
        <button
          onClick={() => handleReaction("chocolate")}
          className="p-2.5 md:p-3 rounded-full bg-gradient-to-br from-amber-700/20 to-brown-500/20 backdrop-blur-xl text-xl md:text-2xl hover:from-amber-700/30 hover:to-brown-500/30 transition-all hover:scale-110 shadow-lg border border-amber-700/30"
        >
          🍫
        </button>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-4 left-4 md:left-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-3 text-primary/40 font-mono text-[10px] md:text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse"></div>
            <span>TRANSMISSION_ACTIVE</span>
          </div>
          <span className="hidden md:inline">•</span>
          <span className="text-[9px] md:text-xs">CHAR_LIMIT: 200</span>
          <span className="hidden md:inline">•</span>
          <span className="text-[9px] md:text-xs animate-pulse">READY</span>
        </div>
      </div>
    </div>
  );
}
