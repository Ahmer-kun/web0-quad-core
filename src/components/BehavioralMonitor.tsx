import React from 'react';
import { Skull } from 'lucide-react';

interface BehavioralMonitorProps {
  lastObservation: string;
  isIdle: boolean;
  rapidClickWarning: boolean;
  clickCount: number;
  secretsCount: number;
}

export const BehavioralMonitor: React.FC<BehavioralMonitorProps> = ({
  lastObservation,
  isIdle,
  rapidClickWarning,
  clickCount,
  secretsCount,
}) => {
  let displayMessage = lastObservation;

  if (rapidClickWarning) {
    displayMessage = 'Repeated behavior detected. Please regain composure.';
  } else if (isIdle) {
    displayMessage = '... Still there? We can wait.';
  }

  return (
    <aside aria-label="Behavioral observation log" className="w-full max-w-xl mx-auto border-t border-neutral-800/80 pt-3 pb-2 px-3 text-xs font-mono text-neutral-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none">
      <div className="flex items-center gap-2 text-neutral-300">
        <span className="text-neutral-300 italic truncate max-w-[280px] sm:max-w-xs">
          "{displayMessage}"
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
        {secretsCount > 0 && (
          <span className="flex items-center gap-1.5 text-amber-400/90" title="Unprompted anomalies cataloged">
            <Skull className="w-3.5 h-3.5 text-neutral-400" />
            <span>Anomalies: {secretsCount}/3</span>
          </span>
        )}
        <span className="text-neutral-700">|</span>
        <span title="Total interaction impulses recorded">
          Actions: {clickCount}
        </span>
      </div>
    </aside>
  );
};

