'use client';

import { useEffect, useState } from 'react';

export default function StatusText() {
  const statusMessages = [
    'Cleaning up the mask',
    'Lurking in the corner',
    'Snuffing stray candles',
    'Tuning the whisper network',
    'Tracing footsteps in the dust',
  ];
  const [statusIndex, setStatusIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const DISPLAY_MS = 3000;
    const FADE_MS = 400;

    let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

    const id = setInterval(() => {
      setFading(true);
      fadeTimeout = setTimeout(() => {
        setStatusIndex((i) => (i + 1) % statusMessages.length);
        setFading(false);
      }, FADE_MS);
    }, DISPLAY_MS);

    return () => {
      clearInterval(id);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, [statusMessages.length]);

  return (
    <p
      className={`text-sm text-zinc-300 transition-opacity duration-500 ease-in-out ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {statusMessages[statusIndex]}
    </p>
  );
}
