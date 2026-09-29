import React, { useRef, useEffect, useState } from 'react';
import { sound } from '../lib/audio.ts';

interface SpecimenCellCanvasProps {
  onSecretFound: (id: string, text: string) => void;
  onAction: () => void;
}

export const SpecimenCellCanvas: React.FC<SpecimenCellCanvasProps> = ({
  onSecretFound,
  onAction,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [homeostasisLevel, setHomeostasisLevel] = useState<number>(50);
  const [mutationRiskToggled, setMutationRiskToggled] = useState<boolean>(false);
  const [cellClickedTimes, setCellClickedTimes] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Homeostasis: somehow maintained.');

  // Animation state ref to avoid React render lags
  const animRef = useRef({
    time: 0,
    nucleusHovered: false,
    mousePos: { x: 150, y: 150 },
    pulseEnergy: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      animRef.current.time += 0.025;
      const t = animRef.current.time;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Grid background (subtle microscopy reticle)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Outer cell membrane deformation using Fourier-like sine harmonics
      const baseRadius = 88;
      const pulse = animRef.current.pulseEnergy;
      animRef.current.pulseEnergy = Math.max(0, pulse * 0.94);

      ctx.beginPath();
      const points = 36;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wave1 = Math.sin(angle * 3 + t) * 4;
        const wave2 = Math.cos(angle * 5 - t * 0.8) * 3;
        const pulseEffect = Math.sin(angle * 8 + t * 4) * (pulse * 8);
        const r = baseRadius + wave1 + wave2 + pulseEffect;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Cytoplasm gradient
      const cytoGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, baseRadius + 15);
      cytoGrad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
      cytoGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.04)');
      cytoGrad.addColorStop(1, 'rgba(5, 150, 105, 0.01)');
      ctx.fillStyle = cytoGrad;
      ctx.fill();

      // Membrane line
      ctx.strokeStyle = mutationRiskToggled ? 'rgba(239, 68, 68, 0.5)' : 'rgba(52, 211, 153, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Mitochondria / Organelles (drifting around)
      const organelles = [
        { angle: t * 0.4, dist: 46, rx: 7, ry: 3 },
        { angle: t * 0.3 + 2, dist: 52, rx: 8, ry: 4 },
        { angle: -t * 0.35 + 4, dist: 42, rx: 6, ry: 3 },
        { angle: t * 0.5 + 5, dist: 58, rx: 5, ry: 2 },
      ];

      organelles.forEach((org) => {
        const ox = cx + Math.cos(org.angle) * org.dist;
        const oy = cy + Math.sin(org.angle) * org.dist;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(org.angle + Math.PI / 4);
        ctx.beginPath();
        ctx.ellipse(0, 0, org.rx, org.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(110, 231, 183, 0.35)';
        ctx.fill();
        ctx.restore();
      });

      // Nucleus in the center
      const nucleusRadius = 26 + Math.sin(t * 1.5) * 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, nucleusRadius, 0, Math.PI * 2);
      ctx.fillStyle = animRef.current.nucleusHovered
        ? 'rgba(16, 185, 129, 0.35)'
        : 'rgba(5, 150, 105, 0.22)';
      ctx.fill();
      ctx.strokeStyle = animRef.current.nucleusHovered
        ? 'rgba(110, 231, 183, 0.9)'
        : 'rgba(52, 211, 153, 0.6)';
      ctx.lineWidth = animRef.current.nucleusHovered ? 2 : 1;
      ctx.stroke();

      // Nucleolus (dense center)
      ctx.beginPath();
      ctx.arc(cx + 2, cy - 2, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(209, 250, 229, 0.4)';
      ctx.fill();

      // Subtle reticle coordinates in corners
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.font = '9px monospace';
      ctx.fillText(`MAG: 2400X`, 10, 16);
      ctx.fillText(`OSC: ${(homeostasisLevel * 0.12).toFixed(2)}Hz`, width - 75, 16);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [homeostasisLevel, mutationRiskToggled]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    animRef.current.mousePos = { x, y };

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const distToCenter = Math.hypot(x - cx, y - cy);

    animRef.current.nucleusHovered = distToCenter < 28;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    onAction();
    sound.playBioPulse();
    animRef.current.pulseEnergy = 1.0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dist = Math.hypot(x - cx, y - cy);

    setCellClickedTimes((prev) => prev + 1);

    // Clicking the nucleus triggers the secret biology discovery
    if (dist < 30) {
      sound.playScanPing();
      onSecretFound(
        'biology_nucleus',
        'Specimen observed. Specimen is observing back. (Probably metaphorical.)'
      );
      setStatusMessage('Specimen is observing back. Probably metaphorical.');
    } else {
      if (cellClickedTimes >= 4) {
        setStatusMessage('Specimen agitation index elevated. Please be gentle.');
      } else {
        setStatusMessage('Cellular deformation logged. Homeostasis reacting.');
      }
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAction();
    const val = Number(e.target.value);
    setHomeostasisLevel(val);
    if (val < 25) {
      setStatusMessage('Homeostasis: depleted. Respiration unverified.');
    } else if (val > 80) {
      setStatusMessage('Homeostasis: hyper-saturated. Cellular anxiety detected.');
    } else {
      setStatusMessage('Homeostasis: somehow maintained.');
    }
  };

  const toggleMutation = () => {
    onAction();
    sound.playMechClick();
    const next = !mutationRiskToggled;
    setMutationRiskToggled(next);
    if (next) {
      setStatusMessage("Mutation risk: Let's not discuss that. Actually, never mind.");
    } else {
      setStatusMessage('Homeostasis: restored to baseline uncertainty.');
    }
  };

  return (
    <div className="w-full bg-[#0d1015] border border-neutral-800/90 rounded-lg p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-5">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-mono text-emerald-400">
            SPECIMEN ANALYSIS // CELLULAR CORE
          </span>
          <h3 className="text-base font-semibold text-neutral-100 font-sans tracking-tight">
            Biological Integrity Scan
          </h3>
        </div>
        <div className="text-right font-mono text-[11px] text-neutral-400">
          <span>TAXON: </span>
          <span className="text-neutral-200">Homo sapiens (allegedly)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Interactive Canvas Viewport */}
        <div className="flex flex-col items-center">
          <div className="relative group cursor-crosshair rounded-full p-1 border border-neutral-800 bg-[#07090c] hover:border-emerald-500/40 transition-colors">
            <canvas
              ref={canvasRef}
              width={260}
              height={260}
              onMouseMove={handleCanvasMouseMove}
              onClick={handleCanvasClick}
              className="rounded-full select-none"
            />
            <div className="absolute bottom-2 text-center w-full pointer-events-none text-[10px] font-mono text-neutral-500">
              [ click nucleus to inspect ]
            </div>
          </div>
          <p className="mt-2 text-[11px] font-mono text-neutral-400">
            Observation Lens: 400x Cytoplasmic Field
          </p>
        </div>

        {/* Biological Metrics & Controls */}
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#080a0d] p-3.5 rounded border border-neutral-800/80 space-y-2">
            <div className="flex justify-between items-center text-neutral-400">
              <span>Cellular status:</span>
              <span className="text-emerald-400 font-medium">Functional</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Mitochondrial state:</span>
              <span className="text-neutral-300">Adequate</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Biological classification:</span>
              <span className="text-neutral-300">Suspicious</span>
            </div>
          </div>

          {/* Homeostasis control */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-neutral-400 text-[11px]">
              <span>Homeostasis Equilibrium</span>
              <span className="text-neutral-200">{homeostasisLevel}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={homeostasisLevel}
              onChange={handleSliderChange}
              className="w-full accent-emerald-500 bg-neutral-800 h-1 rounded cursor-pointer"
            />
          </div>

          {/* Mutation Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={toggleMutation}
              className={`w-full py-2 px-3 rounded text-left border flex items-center justify-between transition-colors ${
                mutationRiskToggled
                  ? 'border-red-900/60 bg-red-950/20 text-red-300'
                  : 'border-neutral-800 bg-[#080a0d] text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>Mutation Risk Assessment</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {mutationRiskToggled ? '[ RESTRICTED ]' : '[ REVIEW ]'}
              </span>
            </button>
          </div>

          {/* Dynamic deadpan status output */}
          <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded text-[11px] text-neutral-300 italic min-h-[44px] flex items-center">
            "{statusMessage}"
          </div>
        </div>
      </div>
    </div>
  );
};
