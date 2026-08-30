import { useState, useEffect, useCallback, useRef } from "react";

export function useActiveSection(sections: { id: string; label: string }[]) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (sections.length < 2) return;

    const handleScroll = () => {
      // Throttle via rAF — avoid expensive state updates on every scroll pixel
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        let current = sections[0]?.id;
        for (const section of sections) {
          const el = document.getElementById(section.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 150) current = section.id;
          }
        }
        setActiveId(current);
      });
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sections]);

  const scrollTo = useCallback((id: string) => {
    // Immediately update active state so indicator responds without waiting for scroll
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return { activeId, scrollTo };
}
