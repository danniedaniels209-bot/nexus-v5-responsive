import { useState, useEffect } from "react";
export function useIsMobile(bp = 768) {
  const [is, setIs] = useState(() => typeof window !== "undefined" ? window.innerWidth <= bp : false);
  useEffect(() => {
    const fn = () => setIs(window.innerWidth <= bp);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return is;
}
export function useBreakpoint() {
  const [w, setW] = useState(() => typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { isMobile: w <= 768, isTablet: w <= 1024, isSmall: w <= 480, width: w };
}
