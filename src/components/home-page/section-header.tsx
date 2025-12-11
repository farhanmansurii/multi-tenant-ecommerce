import React from "react";

export const SectionHeader = ({ number, title }: { number: string, title: string }) => (
  <div className="flex items-end justify-between border-b border-border pb-8 mb-20 reveal-header">
    <h2 className="font-grotesk text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-[0.8]">{title}</h2>
    <span className="font-mono text-xs text-primary mb-2">{number}</span>
  </div>
);
