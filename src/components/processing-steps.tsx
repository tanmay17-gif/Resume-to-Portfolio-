"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

export type Step = { label: string; status: "pending" | "active" | "done" };

export function ProcessingSteps({ steps }: { steps: Step[] }) {
  const activeIndex = steps.findIndex((s) => s.status === "active");
  const isDone = steps.every((s) => s.status === "done");
  const displayIndex = isDone ? steps.length - 1 : activeIndex >= 0 ? activeIndex : 0;
  const currentStep = steps[displayIndex];

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-12 py-12">
      {/* Morphing Visual Object */}
      <div className="relative size-48 flex items-center justify-center">
        {/* Glow */}
        <motion.div
          animate={{
            scale: isDone ? 1.2 : [1, 1.1, 1],
            opacity: isDone ? 0 : [0.5, 0.8, 0.5],
            rotate: isDone ? 0 : [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: isDone ? 0.5 : 8,
            repeat: isDone ? 0 : Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500/30 to-sky-500/30 blur-2xl"
        />

        {/* Morphing Shape */}
        <motion.div
          animate={{
            borderRadius: isDone
              ? ["50%", "50%", "50%", "50%"]
              : ["40% 60% 70% 30%", "30% 70% 50% 50%", "50% 50% 30% 70%", "60% 40% 60% 40%"],
            rotate: isDone ? 0 : [0, 90, 180, 270, 360],
            scale: isDone ? 0 : 1,
          }}
          transition={{
            borderRadius: { duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" },
            rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.5, ease: "backIn" }
          }}
          className="absolute inset-4 bg-gradient-to-br from-violet-100 to-sky-100 border border-white shadow-[inset_0_4px_12px_rgba(255,255,255,1)]"
        />

        {/* Done State */}
        {isDone && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="size-20 rounded-full bg-violet-600 shadow-[0_8px_32px_rgba(124,58,237,0.4)] flex items-center justify-center text-white">
              <CheckCircle2 className="size-10" />
            </div>
          </motion.div>
        )}

        {/* Processing Icon */}
        {!isDone && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute z-10 text-violet-600/50"
          >
            <Sparkles className="size-8" />
          </motion.div>
        )}
      </div>

      {/* Dynamic Text */}
      <div className="text-center space-y-2 h-16">
        <motion.div
          key={currentStep?.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="font-display text-xl font-medium text-slate-800"
        >
          {isDone ? "Portfolio ready." : currentStep?.label}
        </motion.div>
        {!isDone && (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="size-3.5 animate-spin text-violet-500" />
            <span className="text-sm font-medium text-slate-500">
              Step {displayIndex + 1} of {steps.length}
            </span>
          </div>
        )}
      </div>

      {/* Progress Track */}
      <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${((displayIndex + (isDone ? 1 : 0)) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-violet-500 rounded-full"
        />
      </div>
    </div>
  );
}
