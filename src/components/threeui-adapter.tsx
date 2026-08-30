"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// Fallback for loading state
const Loader = () => <div className="w-full h-full bg-transparent" />;

// Helper to create a typed dynamic import
function dyn(name: keyof typeof import("@designcodeio/threeui")) {
  return dynamic<any>(
    () => import("@designcodeio/threeui").then((mod) => (mod as any)[name] as any),
    { ssr: false }
  );
}

// ── Load all needed ThreeUI components ─────────────────────────────────
const ParticleNetwork        = dyn("ParticleNetwork");
const ParticleDrift          = dyn("ParticleDrift");
const OrbitalSphereBackground = dyn("OrbitalSphereBackground");
const DimensionalField       = dyn("DimensionalField");
const FluidFieldBackground   = dyn("FluidFieldBackground");
const HalftoneFlow           = dyn("HalftoneFlow");
const EmberStorm             = dyn("EmberStorm");
const AmberHalftone          = dyn("AmberHalftone");
const RippleStudy            = dyn("RippleStudy");
const BallStudy              = dyn("BallStudy");
const FlowField              = dyn("FlowField");
const LogicCoreField         = dyn("LogicCoreField");
const ConnectivityGraph      = dyn("ConnectivityGraph");
const InterfaceLines         = dyn("InterfaceLines");
const DataField              = dyn("DataField");
const ConstellationField     = dyn("ConstellationField");
const NebulaBackground       = dyn("NebulaBackground");
const WireframeForms         = dyn("WireframeForms");
const TopologyField          = dyn("TopologyField");
const CrtBackground          = dyn("CrtBackground");
const MorphingGlyphCloud     = dyn("MorphingGlyphCloud");
const VoidField              = dyn("VoidField");
const TypographyVortexCanvas = dyn("TypographyVortexCanvas");
const StreamConvergenceBackground = dyn("StreamConvergenceBackground");
const WarpFieldBackground    = dyn("WarpFieldBackground");
const TopoField              = dyn("TopoField");

// ── Generic wrapper to inject any ThreeUI component ────────────────────
function ThreeUISlot({ Component, className = "", opacity = 1, props = {} }: {
  Component: React.ComponentType<any>;
  className?: string;
  opacity?: number;
  props?: Record<string, any>;
}) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden>
      <div className="w-full h-full" style={{ opacity }}>
        <Suspense fallback={<Loader />}>
          <Component {...props} />
        </Suspense>
      </div>
    </div>
  );
}

// ── Per-layout visual slots ─────────────────────────────────────────────

/** Minimal: lightweight CSS-only ambient gradient (avoids canvas OOM from TypographyVortexCanvas) */
export function MinimalHero({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ background: "radial-gradient(ellipse 80% 60% at 20% 40%, #7c3aed 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 60%, #38bdf8 0%, transparent 60%)" }} />
    </div>
  );
}
/** Minimal: ParticleDrift project thumbnail — low opacity to stay lightweight */
export function MinimalProjectVisual({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={ParticleDrift} className={className} opacity={0.35} />;
}

/** Glass: OrbitalSphereBackground fullscreen hero */
export function GlassHero({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={OrbitalSphereBackground} className={className} opacity={0.8} />;
}
/** Glass: DimensionalField project thumbnails */
export function GlassProjectVisual({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={DimensionalField} className={className} opacity={0.7} />;
}
/** Glass: FluidFieldBackground behind skills */
export function GlassSkillsBg({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={FluidFieldBackground} className={className} opacity={0.3} />;
}

/** Bold: HalftoneFlow hero overlay */
export function BoldHero({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={HalftoneFlow} className={className} opacity={0.4} />;
}
/** Bold: EmberStorm featured project */
export function BoldProjectVisual({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={EmberStorm} className={className} opacity={0.9} />;
}
/** Bold: AmberHalftone section accent */
export function BoldSectionAccent({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={AmberHalftone} className={className} opacity={0.25} />;
}

/** Soft: RippleStudy hero */
export function SoftHero({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={RippleStudy} className={className} opacity={0.5} />;
}
/** Soft: BallStudy project thumbnail */
export function SoftProjectVisual({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={BallStudy} className={className} opacity={0.8} />;
}
/** Soft: FlowField skills area */
export function SoftSkillsBg({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={FlowField} className={className} opacity={0.2} />;
}

/** Dark Pro: LogicCoreField sidebar hero */
export function DarkProHero({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={LogicCoreField} className={className} opacity={0.9} />;
}
/** Dark Pro: ConnectivityGraph featured project */
export function DarkProProjectVisual({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={ConnectivityGraph} className={className} opacity={0.85} />;
}
/** Dark Pro: InterfaceLines section dividers */
export function DarkProDivider({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={InterfaceLines} className={className} opacity={0.3} />;
}
/** Dark Pro: DataField skills grid bg */
export function DarkProSkillsBg({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={DataField} className={className} opacity={0.4} />;
}
/** Dark Pro: particle network bg for dashboard panels */
export function DarkProPanelBg({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={ParticleNetwork} className={className} opacity={0.4}
    props={{ particleColor: "#38bdf8", lineColor: "rgba(56,189,248,0.1)", density: 40 }} />;
}

/** Classic: ConstellationField subtle hero */
export function ClassicHero({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={ConstellationField} className={className} opacity={0.08} />;
}

/** Grid: NebulaBackground hero */
export function GridHero({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={NebulaBackground} className={className} opacity={0.9} />;
}
/** Grid: WireframeForms featured project (deterministic by seed) */
export function GridProjectVisual({ seed = "", className = "" }: { seed?: string; className?: string }) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const forms = ["cube", "sphere", "torus", "icosahedron"] as const;
  const form = forms[hash % forms.length];
  return <ThreeUISlot Component={WireframeForms} className={className} opacity={0.85} props={{ form }} />;
}
/** Grid: TopologyField skills module */
export function GridSkillsBg({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={TopologyField} className={className} opacity={0.35} />;
}

/** Retro: CrtBackground full page */
export function RetroBg({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={CrtBackground} className={className} opacity={0.6} />;
}
/** Retro: MorphingGlyphCloud hero */
export function RetroHero({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={MorphingGlyphCloud} className={className} opacity={0.7} />;
}
/** Retro: VoidField project panel */
export function RetroProjectVisual({ className = "" }: { className?: string }) {
  return <ThreeUISlot Component={VoidField} className={className} opacity={0.8} />;
}
