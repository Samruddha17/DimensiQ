import React from "react";

const CabinetFrontView = ({ inputs }) => {
  // Parse dimensions safely
  const W = parseFloat(inputs.W) || 600;
  const H = parseFloat(inputs.H) || 720;
  const T = parseFloat(inputs.T) || 18;
  const H_lev = parseFloat(inputs.H_lev) || 7;
  const shelvesCount = parseInt(inputs.shelfCount, 10) || 0;
  const doorStyle = inputs.doorStyle;

  const H_c = H - H_lev; // Usable carcase height
  const innerW = W - 2 * T;
  const innerH = H_c - 2 * T;

  // Calculate dynamic SVG canvas bounds to fit open doors and dimension lines
  const doorClearance = doorStyle === "double" ? W : doorStyle === "single" ? W : 0;
  const canvasW = W + doorClearance + 150;
  const canvasH = H + 150;

  // Center the cabinet in the canvas
  const startX = (canvasW - W) / 2;
  const startY = 50; // Top padding

  // Calculate shelf Y-coordinates based on equal spacing
  const shelfSpacing = (innerH - shelvesCount * T) / (shelvesCount + 1);
  const shelves = Array.from({ length: shelvesCount }).map((_, i) => {
    return startY + T + shelfSpacing * (i + 1) + T * i;
  });

  return (
    <div className="w-full flex justify-center bg-slate-50 border border-slate-200 rounded-lg p-6 shadow-inner">
      <svg viewBox={`0 0 ${canvasW} ${canvasH}`} className="w-full max-w-2xl font-mono" xmlns="http://www.w3.org/2000/svg">
        {/* 1. Outer Carcase (The Box) */}
        <rect x={startX} y={startY} width={W} height={H_c} fill="#f1f5f9" stroke="#334155" strokeWidth="2" />

        {/* 2. Inner Hollow (Subtracting Ply Thickness) */}
        <rect x={startX + T} y={startY + T} width={innerW} height={innerH} fill="#e2e8f0" stroke="#475569" strokeWidth="1" />

        {/* 3. Internal Shelves */}
        {shelves.map((shelfY, idx) => (
          <rect key={`shelf-${idx}`} x={startX + T} y={shelfY} width={innerW} height={T} fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
        ))}

        {/* 4. Levelers / Skirting */}
        {H_lev > 0 && (
          <>
            <rect x={startX + 20} y={startY + H_c} width={20} height={H_lev} fill="#94a3b8" />
            <rect x={startX + W - 40} y={startY + H_c} width={20} height={H_lev} fill="#94a3b8" />
          </>
        )}

        {/* 5. Open Doors (Swung out to the sides) */}
        {doorStyle === "single" && (
          // Single door hinged left, opened 180 degrees
          <rect x={startX - W} y={startY} width={W} height={H_c} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
        )}
        {doorStyle === "double" && (
          <>
            {/* Left Door */}
            <rect x={startX - W / 2} y={startY} width={W / 2} height={H_c} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
            {/* Right Door */}
            <rect x={startX + W} y={startY} width={W / 2} height={H_c} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
          </>
        )}

        {/* 6. Outer Dimension Lines */}
        {/* Width */}
        <line x1={startX} y1={startY - 20} x2={startX + W} y2={startY - 20} stroke="#64748b" strokeWidth="1.5" />
        <line x1={startX} y1={startY} x2={startX} y2={startY - 25} stroke="#64748b" strokeWidth="1" />
        <line x1={startX + W} y1={startY} x2={startX + W} y2={startY - 25} stroke="#64748b" strokeWidth="1" />
        <text x={startX + W / 2} y={startY - 30} textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="bold">
          W: {W} mm
        </text>

        {/* Total Height */}
        <line x1={startX + W + 20} y1={startY} x2={startX + W + 20} y2={startY + H} stroke="#64748b" strokeWidth="1.5" />
        <line x1={startX + W} y1={startY} x2={startX + W + 25} y2={startY} stroke="#64748b" strokeWidth="1" />
        <line x1={startX + W} y1={startY + H} x2={startX + W + 25} y2={startY + H} stroke="#64748b" strokeWidth="1" />
        <g transform={`translate(${startX + W + 35}, ${startY + H / 2})`}>
          <text x="0" y="0" transform="rotate(270)" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="bold">
            H: {H} mm
          </text>
        </g>
      </svg>
    </div>
  );
};

export default CabinetFrontView;
