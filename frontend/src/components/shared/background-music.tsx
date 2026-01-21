'use client';

import { useEffect, useRef, useState } from 'react';

import { Volume2, VolumeX } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = 0.3;

    const attemptPlay = async () => {
      try {
        await audio.play();
        setHasInteracted(true);
      } catch (error) {
        console.log('Autoplay prevented, waiting for user interaction');
      }
    };

    attemptPlay();

    const startOnInteraction = async () => {
      if (!hasInteracted && audio.paused) {
        try {
          await audio.play();
          setHasInteracted(true);
        } catch (error) {
          console.error('Failed to play audio:', error);
        }
      }
    };

    document.addEventListener('click', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);

    return () => {
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
    };
  }, [hasInteracted]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/background-music.mp3" preload="auto" />

      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className="h-12 w-12 cursor-pointer rounded-full border-zinc-700/50 bg-zinc-900/90 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-zinc-800/90"
          title={isMuted ? 'Unmute music' : 'Mute music'}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-zinc-400" />
          ) : (
            <Volume2 className="h-5 w-5 text-amber-500" />
          )}
        </Button>
      </div>
    </>
  );
}
