import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Play, RefreshCw } from 'lucide-react';

export default function Wheel({ options, onSpinEnd, isSpinning, disabled }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;

    ctx.clearRect(0, 0, size, size);

    if (!options || options.length === 0) return;

    const sliceAngle = (2 * Math.PI) / options.length;

    options.forEach((opt, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Draw Slice
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = opt.color || '#3B82F6';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Draw Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(opt.label.length > 15 ? opt.label.substring(0, 15) + '...' : opt.label, radius - 20, 5);
      ctx.restore();
    });

    // Center Pin Ring
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();
  }, [options]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Top Pointer Indicator */}
      <div className="absolute -top-3 z-20 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-amber-500 drop-shadow-md" />

      <div
        className="relative rounded-full p-2 bg-slate-800/80 backdrop-blur border border-slate-700/50 shadow-2xl overflow-hidden"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.90, 0.20, 1.00)' : 'none'
        }}
      >
        <canvas ref={canvasRef} width={380} height={380} className="rounded-full max-w-full h-auto" />
      </div>
    </div>
  );
}
