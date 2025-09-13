'use client';

import { Particles } from '@/components/ui/shadcn-io/particles/index';

interface WeatherParticlesProps {
  type: 'rain' | 'snow';
}

export default function WeatherParticles({ type }: WeatherParticlesProps) {
  // Configure particle settings for rain vs snow
  const settings =
    type === 'rain'
      ? { quantity: 200, size: 2, vy: 15, vx: 0, color: '#ffffff' }
      : { quantity: 100, size: 4, vy: 3, vx: 1, color: '#ffffff' };

  return (
    <Particles
      className="absolute inset-0 -z-10"
      quantity={settings.quantity}
      size={settings.size}
      vy={settings.vy}
      color={settings.color}
    />
  );
}
