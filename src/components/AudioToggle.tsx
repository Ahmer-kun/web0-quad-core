import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '../lib/audio.ts';

export const AudioToggle: React.FC = () => {
  const [enabled, setEnabled] = useState(sound.enabled);

  const handleToggle = () => {
    const next = sound.toggle();
    setEnabled(next);
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs tracking-wider font-mono text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 backdrop-blur transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-600 cursor-pointer"
      title={enabled ? 'Mute synthesized feedback' : 'Enable synthesized feedback'}
      aria-label="Toggle sound feedback"
    >
      {enabled ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">AUDIO ON</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
          <span>AUDIO MUTED</span>
        </>
      )}
    </button>
  );
};
