import React, { useState } from 'react';
import { sound } from '../lib/audio.ts';
import { Disc3 } from 'lucide-react';

interface TwoWheelBalanceProps {
  onSecretFound: (id: string, text: string) => void;
  onAction: () => void;
}

export const TwoWheelBalance: React.FC<TwoWheelBalanceProps> = ({
  onSecretFound,
  onAction,
}) => {
  const [leanAngle, setLeanAngle] = useState<number>(0);
  const [sprocketRot, setSprocketRot] = useState<number>(0);
  const [bikeMessage, setBikeMessage] = useState<string>(
    'Two wheels detected. Stability is now your responsibility.'
  );

  const handleLeanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAction();
    const angle = Number(e.target.value);
    setLeanAngle(angle);

    if (Math.abs(angle) > 35) {
      setBikeMessage('Lean angle extreme. Common sense: not detected.');
    } else if (Math.abs(angle) > 18) {
      setBikeMessage(`Lean angle: ${angle}°. Friction limits currently unconsulted.`);
    } else {
      setBikeMessage('Two wheels detected. Stability is now your responsibility.');
    }
  };

  const handleSprocketSpin = () => {
    onAction();
    sound.playMechClick();
    setSprocketRot((prev) => prev + 45);
  };

  const handleChainLinkClick = () => {
    onAction();
    sound.playScanPing();
    onSecretFound(
      'bike_chain_link',
      'Chain tension: acceptable. Patience: questionable. Common sense: not factory installed.'
    );
    setBikeMessage(
      'Chain tension: acceptable. Common sense: not factory installed.'
    );
  };

  return (
    <div className="w-full bg-[#0d1015] border border-neutral-800/90 rounded-lg p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-5">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-mono text-cyan-400">
            DYNAMICS TELEMETRY // GYROSCOPIC EQUILIBRIUM
          </span>
          <h3 className="text-base font-semibold text-neutral-100 font-sans tracking-tight">
            Two-Wheel System Diagnostic
          </h3>
        </div>
        <div className="text-right font-mono text-[11px] text-neutral-400">
          <span>CONTACT PATCH: </span>
          <span className="text-neutral-200">2 × 4cm²</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visualizer: Motorcycle Roll & Gyroscopic indicator */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-52 h-52 rounded-xl border border-neutral-800 bg-[#07090c] flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Horizon reference lines */}
            <div className="absolute w-full h-[1px] bg-neutral-800 top-1/2 -translate-y-1/2" />
            <div className="absolute h-full w-[1px] bg-neutral-800/60 left-1/2 -translate-x-1/2" />

            {/* Tilting Chassis & Wheels Assembly */}
            <div
              className="relative transition-transform duration-100 flex flex-col items-center"
              style={{ transform: `rotate(${leanAngle}deg)` }}
            >
              {/* Handlebar / Fork */}
              <div className="w-16 h-1 bg-cyan-400/80 rounded-full mb-1" />
              <div className="w-1 h-12 bg-neutral-500 rounded" />

              {/* Front Wheel / Disc */}
              <div className="relative w-20 h-20 rounded-full border-2 border-neutral-600 bg-neutral-900/80 flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 rounded-full border border-dashed border-cyan-500/60" />
                <div className="absolute w-2 h-2 rounded-full bg-cyan-400" />
              </div>

              {/* Ground contact shadow */}
              <div className="w-12 h-1 bg-cyan-500/20 rounded-full blur-xs mt-1" />
            </div>

            {/* Sprocket & Chain easter egg in corner */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-[#090b0e] p-1.5 rounded border border-neutral-800/80">
              <button
                type="button"
                onClick={handleSprocketSpin}
                className="text-neutral-400 hover:text-cyan-400 transition-colors cursor-pointer"
                title="Rotate drive sprocket"
              >
                <Disc3
                  className="w-4 h-4 transition-transform duration-200"
                  style={{ transform: `rotate(${sprocketRot}deg)` }}
                />
              </button>
              <button
                type="button"
                onClick={handleChainLinkClick}
                className="text-[9px] font-mono text-neutral-400 hover:text-cyan-300 border-l border-neutral-800 pl-1.5 cursor-pointer"
                title="Inspect master chain link"
              >
                [LINK]
              </button>
            </div>

            <div className="absolute top-2 left-2 text-[10px] font-mono text-neutral-400">
              LEAN: {leanAngle > 0 ? `+${leanAngle}°` : `${leanAngle}°`}
            </div>
          </div>

          <p className="mt-2 text-[11px] font-mono text-neutral-400">
            Gyroscopic Roll Angle Sensor: Calibrated
          </p>
        </div>

        {/* Metrics & Lean Slider */}
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#080a0d] p-3.5 rounded border border-neutral-800/80 space-y-2">
            <div className="flex justify-between items-center text-neutral-400">
              <span>Drive chain:</span>
              <span className="text-cyan-400 font-medium">Connected</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Wheels:</span>
              <span className="text-neutral-300">Approximately round</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Decision-making:</span>
              <span className="text-neutral-300">Unknown</span>
            </div>
          </div>

          {/* Lean Angle Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-neutral-400 text-[11px]">
              <span>Adjust Lean Angle</span>
              <span className="text-neutral-200">{leanAngle}°</span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              value={leanAngle}
              onChange={handleLeanChange}
              className="w-full accent-cyan-500 bg-neutral-800 h-1 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-400">
              <span>-45° (LEFT PEG)</span>
              <span>0° (UPRIGHT)</span>
              <span>+45° (RIGHT PEG)</span>
            </div>
          </div>

          {/* Reset upright button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onAction();
                setLeanAngle(0);
                setBikeMessage('Chassis leveled. Natural equilibrium restored.');
              }}
              className="w-full py-2 px-3 rounded text-center border border-neutral-800 bg-[#080a0d] text-neutral-400 hover:text-neutral-200 text-xs transition-colors cursor-pointer"
            >
              RESTORE UPRIGHT ORIENTATION
            </button>
          </div>

          {/* Dynamic observation line */}
          <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded text-[11px] text-neutral-300 italic min-h-[44px] flex items-center">
            "{bikeMessage}"
          </div>
        </div>
      </div>
    </div>
  );
};
