"use client";

import React, { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

// --- 3. EXPERIMENTAL FEATURES: "THE LENS REVEAL" ---
// A complex mouse-tracking effect where you "X-Ray" the UI.
export const XRayFeatures = () => {
  const container = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!container.current) return;
    const rect = container.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <section className="py-32 bg-[#0a0a0a] text-[#e1e1e1] overflow-hidden">
      <div className="container mx-auto px-6 mb-24 flex items-end justify-between">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
          Multi-Tenant <br /> <span className="text-[#C5F74F]">Native.</span>
        </h2>
        <div className="hidden md:block text-right">
          <p className="font-mono text-xs opacity-50 mb-2">INTERACTION: HOVER TO INSPECT</p>
          <div className="w-32 h-[1px] bg-white/20 ml-auto" />
        </div>
      </div>

      <div
        ref={container}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-6xl mx-auto h-[600px] border border-white/10 rounded-xl bg-[#111] overflow-hidden group cursor-crosshair"
      >
        {/* LAYER 1: The "Wireframe" (Underneath) */}
        <div className="absolute inset-0 p-12 flex flex-col justify-between opacity-30 font-mono text-[#C5F74F]">
          <div className="border border-dashed border-[#C5F74F]/50 p-4 h-full">
            <div className="text-xs mb-4">{'<DashboardLayout>'}</div>
            <div className="grid grid-cols-3 gap-4 h-3/4">
              <div className="border border-dashed border-[#C5F74F]/30 flex items-center justify-center">{'<Sidebar />'}</div>
              <div className="col-span-2 border border-dashed border-[#C5F74F]/30 flex items-center justify-center">
                <div className="text-center">
                  <div>{'<TenantData id={user.tenantId} />'}</div>
                  <div className="text-xs mt-2 opacity-50">Data Isolation: Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LAYER 2: The "Clean UI" (On Top) - Masked by ClipPath */}
        <div
          className="absolute inset-0 bg-background text-foreground p-12 flex flex-col justify-between pointer-events-none"
          style={{
            clipPath: `circle(250px at ${mousePos.x}px ${mousePos.y}px)`,
            transition: 'clip-path 0.1s ease-out' // Smooth lag for weight
          }}
        >
          {/* The Clean Design Content */}
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="text-sm font-semibold bg-muted px-3 py-1 rounded-full">Kiosk Dashboard</div>
            </div>

            <div className="grid grid-cols-12 gap-6 h-full">
              <div className="col-span-3 bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="h-8 w-full bg-foreground/5 rounded" />
                <div className="h-4 w-1/2 bg-foreground/5 rounded" />
                <div className="h-4 w-2/3 bg-foreground/5 rounded" />
              </div>
              <div className="col-span-9 bg-muted/20 rounded-xl p-8">
                <h3 className="text-3xl font-bold mb-2">Store Overview</h3>
                <p className="text-muted-foreground mb-8">All systems operational.</p>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-background rounded-lg shadow-sm border border-border/50 p-4">
                      <div className="text-2xl font-bold">$12,40{i}</div>
                      <div className="text-xs text-muted-foreground">Total Revenue</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Label following cursor */}
        <div
          className="absolute pointer-events-none text-[10px] font-mono text-[#C5F74F] bg-black/80 px-2 py-1 rounded border border-[#C5F74F]/20 backdrop-blur-md z-50 whitespace-nowrap"
          style={{
            left: mousePos.x + 20,
            top: mousePos.y + 20,
            opacity: 0.8
          }}
        >
          VIEWING: TENANT_ISOLATION_LAYER
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {["Global Distribution", "Edge Caching", "Automated Tax"].map((feat, i) => (
          <div key={i} className="border-t border-white/10 pt-4">
            <ArrowUpRight className="mb-4 text-[#C5F74F]" />
            <h4 className="text-xl font-bold mb-2">{feat}</h4>
            <p className="text-sm opacity-50 font-mono">
              Optimized for high-concurrency environments. 99.99% Uptime guaranteed.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
