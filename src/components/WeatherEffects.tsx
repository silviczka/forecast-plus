'use client';

import React, { useEffect } from 'react';
import { Particles } from '@/components/ui/shadcn-io/particles';

export default function WeatherEffects({
  weatherKeyword,
}: WeatherEffectsProps) {
  // Determine particle type
  const isSnow = /snow|sleet|ice/i.test(weatherKeyword);
  const isRain = /rain|drizzle|thunder/i.test(weatherKeyword);
  const isThunder = /thunder/i.test(weatherKeyword);

  // Particle settings
  const settings = isSnow
    ? { type: 'snow', quantity: 100, size: 4, vy: 3, vx: 1, color: '#ffffff' }
    : isRain
    ? { type: 'rain', quantity: 130, size: 5, vy: 8, vx: 0, color: '#9ecfff' }
    : null;

  useEffect(() => {
    if (!isThunder) return;

    const lightning = document.getElementById('lightning');
    if (!lightning) return;

    lightning.style.opacity = '0';

    const flashLightning = () => {
      lightning.style.transition = 'none';
      lightning.style.opacity = '0.3'; // flash intensity

      // fade out quickly
      setTimeout(() => {
        lightning.style.transition = 'opacity 0.2s ease-out';
        lightning.style.opacity = '0';
      }, 750); // flash lasts 500ms
    };

    // Recursive random interval instead of setInterval
    const scheduleFlash = () => {
      const delay = 25000 + Math.random() * 5000; // 25–30s distance between flashes
      setTimeout(() => {
        flashLightning();
        scheduleFlash(); // schedule next flash
      }, delay);
    };

    scheduleFlash();

    // cleanup
    return () => {
      if (lightning) lightning.style.opacity = '0';
    };
  }, [isThunder]);

  // Render nothing if no rain/snow
  if (!settings) return null;

  return (
    <>
      <Particles
        className="absolute inset-0 -z-0"
        quantity={settings.quantity}
        size={settings.size}
        vy={settings.vy}
        vx={settings.vx}
        color={settings.color}
      />
      {isThunder && (
        <div
          id="lightning"
          className="absolute inset-0 -z-0 bg-white opacity-20 pointer-events-none"
        />
      )}
    </>
  );
}
