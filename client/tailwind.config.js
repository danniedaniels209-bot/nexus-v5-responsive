/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:       "#0B0B0F",
        surface:  "#111827",
        elevated: "#1A2236",
        overlay:  "#1E2D45",
        purple: {
          DEFAULT:  "#8B5CF6",
          light:    "#A78BFA",
          dim:      "#7C3AED",
          soft:     "rgba(139,92,246,0.12)",
          ring:     "rgba(139,92,246,0.35)",
          glow:     "rgba(139,92,246,0.5)",
        },
        cyan: {
          DEFAULT:  "#22D3EE",
          light:    "#67E8F9",
          dim:      "#0891B2",
          soft:     "rgba(34,211,238,0.12)",
          ring:     "rgba(34,211,238,0.35)",
          glow:     "rgba(34,211,238,0.5)",
        },
        text1:    "#E5E7EB",
        text2:    "#9CA3AF",
        text3:    "#6B7280",
        success:  "#10B981",
        error:    "#EF4444",
        warning:  "#F59E0B",
      },
      fontFamily: {
        sans:  ["'DM Sans'", "system-ui", "sans-serif"],
        serif: ["'Instrument Serif'", "Georgia", "serif"],
        mono:  ["'DM Mono'", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
      },
      boxShadow: {
        "glass":       "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glass-lg":    "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        "purple-glow": "0 0 30px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)",
        "cyan-glow":   "0 0 30px rgba(34,211,238,0.3), 0 0 60px rgba(34,211,238,0.1)",
        "card":        "0 4px 24px rgba(0,0,0,0.35)",
        "card-hover":  "0 8px 40px rgba(0,0,0,0.5)",
      },
      animation: {
        "float":         "float 6s ease-in-out infinite",
        "float-delay":   "float 6s ease-in-out 2s infinite",
        "pulse-slow":    "pulse 4s ease-in-out infinite",
        "glow-purple":   "glowPurple 3s ease-in-out infinite alternate",
        "glow-cyan":     "glowCyan 3s ease-in-out infinite alternate",
        "slide-up":      "slideUp 0.4s cubic-bezier(0.22,1,0.36,1)",
        "slide-down":    "slideDown 0.4s cubic-bezier(0.22,1,0.36,1)",
        "fade-in":       "fadeIn 0.3s ease-out",
        "scale-in":      "scaleIn 0.3s cubic-bezier(0.22,1,0.36,1)",
        "shimmer":       "shimmer 2s linear infinite",
        "spin-slow":     "spin 8s linear infinite",
        "particle":      "particle 12s linear infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-14px)" },
        },
        glowPurple: {
          from: { boxShadow: "0 0 20px rgba(139,92,246,0.2)" },
          to:   { boxShadow: "0 0 50px rgba(139,92,246,0.5), 0 0 100px rgba(139,92,246,0.2)" },
        },
        glowCyan: {
          from: { boxShadow: "0 0 20px rgba(34,211,238,0.2)" },
          to:   { boxShadow: "0 0 50px rgba(34,211,238,0.5), 0 0 100px rgba(34,211,238,0.2)" },
        },
        slideUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: 0, transform: "translateY(-20px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        scaleIn: {
          from: { opacity: 0, transform: "scale(0.94)" },
          to:   { opacity: 1, transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        particle: {
          "0%":   { transform: "translateY(100vh) rotate(0deg)", opacity: 0 },
          "10%":  { opacity: 1 },
          "90%":  { opacity: 1 },
          "100%": { transform: "translateY(-100px) rotate(720deg)", opacity: 0 },
        },
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
        "400": "400ms",
      },
    },
  },
  plugins: [],
};
