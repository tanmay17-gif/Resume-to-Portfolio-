"use client";

export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`aurora-wrapper absolute inset-0 -z-10 pointer-events-none ${className}`} aria-hidden>
      <div className="aurora-bg" />
    </div>
  );
}
