'use client';

import { useState, useEffect } from 'react';

type ReactionType = 'heart' | 'flame' | 'chocolate';

interface Reaction {
  id: number;
  type: ReactionType;
  style: React.CSSProperties;
}

export default function ReactionAnimation({
  trigger,
}: {
  trigger: { type: ReactionType; count: number } | null;
}) {
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const newReactions: Reaction[] = Array.from({ length: 20 }).map(
      (_, i) => ({
        id: Date.now() + i,
        type: trigger.type,
        style: {
          left: `${Math.random() * 90 + 5}%`, // Avoid edges
          animationDelay: `${Math.random() * 0.5}s`,
          animationDuration: `${2.5 + Math.random() * 2}s`,
          transform: `scale(${Math.random() * 0.8 + 0.6})`,
        },
      })
    );

    setReactions((prev) => [...prev, ...newReactions]);

    const timer = setTimeout(() => {
      // Remove only the reactions that have finished animating
      setReactions((prev) => prev.slice(newReactions.length));
    }, 5000); // Should be longer than animation duration + delay

    return () => clearTimeout(timer);
  }, [trigger]);

  const icons: { [key in ReactionType]: string } = {
    heart: '❤️',
    flame: '🔥',
    chocolate: '🍫',
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {reactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute bottom-[-10%] animate-reaction-float text-3xl md:text-4xl"
          style={reaction.style}
        >
          {icons[reaction.type]}
        </div>
      ))}
    </div>
  );
}
