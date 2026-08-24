/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F8F5F2",
        section: "#EFE7DD",
        brown: {
          DEFAULT: "#5C4033",
          dark: "#3E2723",
          warm: "#8D6E63",
          coffee: "#6D4C41",
        },
        gold: "#C8A165",
        ink: "#2F241F",
        muted: "#6E625B",
        line: "#D8CFC7",
        ok: "#2E7D32",
      },
      fontFamily: {
        display: ["'General Sans'", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        premium: "0 20px 60px -15px rgba(62, 39, 35, 0.25)",
        soft: "0 8px 30px -10px rgba(62, 39, 35, 0.15)",
        glow: "0 0 0 1px rgba(200,161,101,0.35), 0 20px 50px -20px rgba(200,161,101,0.45)",
      },
      borderRadius: {
        xl2: "1.75rem",
        xl3: "2.5rem",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
