'use client';
import React from 'react';

const SparkleRain = () => {
  const sparkles = Array.from({ length: 70 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {sparkles.map((_, i) => (
        <div
          key={i}
          className="sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
};

export default SparkleRain;
