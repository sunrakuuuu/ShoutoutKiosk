'use client';

import { Heart } from 'lucide-react';
import React from 'react';

const FloatingHearts = () => {
  const hearts = Array.from({ length: 25 });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {hearts.map((_, i) => (
        <div
          key={i}
          className="absolute bottom-[-10%] animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${8 + Math.random() * 12}s`,
            transform: `scale(${Math.random() * 0.7 + 0.5})`,
          }}
        >
          <Heart
            className="text-primary/30 fill-primary/20"
            style={{
              width: `${Math.floor(Math.random() * 25) + 15}px`,
              height: 'auto',
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;
