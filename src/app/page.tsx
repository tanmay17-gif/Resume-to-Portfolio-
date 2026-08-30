"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, FileText, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ── Step card ──────────────────────────────────────────────────────────────────
function StepCard({
  n, title, desc, delay,
}: { n: string; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative pl-8 border-l border-[#d8d5cc]"
    >
      <span
        className="absolute left-[-1px] top-0 h-4 w-px"
        style={{ background: "var(--ed-charcoal)" }}
      />
      <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#9a9890] mb-3">{n}</div>
      <h3
        className="text-[18px] font-semibold text-[#1a1a18] leading-snug mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <p className="text-sm text-[#6b6860] leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function Home() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      if (data.session) setAuthed(true);
    });
  }, []);

  const ctaHref = authed ? "/dashboard" : "/login";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--ed-ivory, #f7f5f0)", color: "var(--ed-charcoal, #1a1a18)" }}
    >
      {/* Navigation */}
      <header
        className="sticky top-0 z-50 border-b border-[#e0ddd4]"
        style={{ background: "rgba(247,245,240,0.85)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="size-7 flex items-center justify-center"
              style={{ background: "var(--ed-charcoal, #1a1a18)" }}
            >
              <FileText className="size-3.5 text-[#f7f5f0]" />
            </div>
            <div>
              <span
                className="text-[13px] font-semibold tracking-tight leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Resume to Portfolio
              </span>
              <div className="text-[9px] text-[#9a9890] tracking-[0.12em] uppercase leading-none mt-0.5">
                AI Studio
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-5">
            <Link
              href="#how-it-works"
              className="text-[12px] font-medium text-[#6b6860] hover:text-[#1a1a18] transition-colors hidden sm:block tracking-wide"
            >
              How it works
            </Link>
            {authed && (
              <Link
                href="/dashboard"
                className="text-[12px] font-medium text-[#6b6860] hover:text-[#1a1a18] transition-colors hidden sm:block tracking-wide"
              >
                Dashboard
              </Link>
            )}
            <Link
              href={ctaHref}
              className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold tracking-wide transition-colors"
              style={{ background: "var(--ed-charcoal, #1a1a18)", color: "#faf9f6" }}
            >
              {authed ? "Go to Studio" : "Sign in"}
              <ArrowRight className="size-3" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 mb-8"
              >
                <div
                  className="flex items-center gap-2 px-3 py-1.5 border border-[#d8d5cc]"
                  style={{ background: "var(--ed-cream, #faf9f6)" }}
                >
                  <Sparkles className="size-3 text-emerald-600" />
                  <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#6b6860]">
                    AI-Powered Portfolio Builder
                  </span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5rem] font-semibold leading-[1.0] tracking-tight mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your resume,<br />
                <em className="not-italic" style={{ color: "var(--ed-muted, #6b6860)" }}>
                  designed as a
                </em>
                <br />
                portfolio.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="text-[16px] text-[#6b6860] leading-relaxed mb-10 max-w-[400px]"
              >
                Upload a PDF or DOCX. Our AI reads, structures, and curates your
                experience into a premium portfolio — in 8 distinct visual styles.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-4"
              >
                <Link
                  href={ctaHref}
                  className="flex items-center gap-2.5 px-6 py-3.5 text-[13px] font-semibold tracking-wide hover:opacity-90 transition-opacity group"
                  style={{ background: "var(--ed-charcoal, #1a1a18)", color: "#faf9f6" }}
                >
                  {authed ? "Go to Studio" : "Start Building"}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <span className="text-[11px] text-[#9a9890] tracking-wide">
                  No credit card needed
                </span>
              </motion.div>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-wrap items-center gap-4 mt-10"
              >
                {["8 Visual Styles", "Instant Extraction", "Live Public URL"].map((f) => (
                  <span key={f} className="flex items-center gap-1.5 text-[11px] text-[#6b6860] font-medium">
                    <Check className="size-3 text-emerald-600" />
                    {f}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: Editorial visual */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              <div
                className="border border-[#d8d5cc] overflow-hidden"
                style={{ background: "var(--ed-cream, #faf9f6)" }}
              >
                {/* Fake browser chrome */}
                <div
                  className="h-9 border-b border-[#e0ddd4] flex items-center px-4 gap-3"
                  style={{ background: "var(--ed-ivory, #f7f5f0)" }}
                >
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="size-2 rounded-full bg-[#d8d5cc]" />
                    ))}
                  </div>
                  <div className="flex-1 text-center text-[10px] text-[#9a9890] font-mono tracking-wider">
                    portfolio / minimal
                  </div>
                </div>

                {/* Portfolio mock content */}
                <div className="p-8">
                  <div className="mb-6">
                    <div className="h-px bg-[#e0ddd4] mb-6" />
                    <div
                      className="text-[28px] font-semibold tracking-tight mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Tanmay Chaudhary
                    </div>
                    <div className="text-[11px] text-[#9a9890] tracking-[0.14em] uppercase mb-4">
                      Full-Stack Developer & AI Engineer
                    </div>
                    <div className="h-px bg-[#e0ddd4]" />
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Experience", value: "4 years" },
                      { label: "Projects", value: "8 featured" },
                      { label: "Skills", value: "React · Python · AI/ML" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-baseline justify-between border-b border-[#eae7df] pb-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a9890]">{row.label}</span>
                        <span className="text-[12px] text-[#1a1a18] font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2">
                    {["Minimal", "Dark Pro", "Retro", "Bold"].map((s, i) => (
                      <div
                        key={s}
                        className={`px-3 py-2 text-[10px] font-medium tracking-wide flex items-center justify-between border ${i === 0 ? "border-[#1a1a18] text-[#1a1a18]" : "border-[#e0ddd4] text-[#9a9890]"}`}
                        style={i === 0 ? { background: "var(--ed-cream)" } : {}}
                      >
                        {s}
                        {i === 0 && <span className="size-1.5 rounded-full bg-emerald-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating label */}
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -right-4 px-3 py-2 border border-[#d8d5cc] flex items-center gap-2"
                style={{ background: "var(--ed-charcoal, #1a1a18)", color: "#faf9f6" }}
              >
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono tracking-wider">Live Published</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-t border-[#e0ddd4]"
          style={{ background: "var(--ed-cream, #faf9f6)" }}
        >
          <div className="max-w-6xl mx-auto px-6 py-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-16"
            >
              <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#9a9890] mb-3">The Process</div>
              <h2
                className="text-[2rem] font-semibold tracking-tight text-[#1a1a18]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                From resume to portfolio in 3 steps.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12">
              <StepCard
                n="01"
                title="Upload your resume"
                desc="PDF or DOCX. Our AI reads and parses even complex multi-column layouts with full fidelity."
                delay={0}
              />
              <StepCard
                n="02"
                title="AI extracts & curates"
                desc="Gemini structures your data, rewrites bullets, and generates a professional summary — your voice, elevated."
                delay={0.1}
              />
              <StepCard
                n="03"
                title="Pick a style & publish"
                desc="Choose from 8 distinct visual identities. Each uses a different layout, motion system, and visual language."
                delay={0.2}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="border-t border-[#e0ddd4] py-6"
        style={{ background: "var(--ed-cream, #faf9f6)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="text-[11px] text-[#9a9890]">
            Resume to Portfolio · AI Studio
          </div>
          <div className="text-[11px] text-[#9a9890]">
            Built with Next.js · Supabase · Gemini
          </div>
        </div>
      </footer>
    </div>
  );
}
