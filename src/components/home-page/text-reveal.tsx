import React from "react";

export const TextReveal = () => {
  return (
    <section className="py-40 border-y border-border overflow-hidden">
      <div className="relative">
        <h2 className="font-grotesk text-[20vw] leading-none font-bold text-transparent stroke-text opacity-20 whitespace-nowrap pl-10">
          NEXT.JS 16 DRIZZLE
        </h2>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="font-mono text-primary uppercase tracking-widest mb-4">The New Standard</p>
          <p className="text-3xl md:text-5xl font-light max-w-3xl leading-tight">
            "We stripped away the complexity to reveal the raw power of Server Components."
          </p>
        </div>
      </div>
      <style jsx>{`
        .stroke-text {
            -webkit-text-stroke: 1px var(--foreground);
        }
      `}</style>
    </section>
  );
};
