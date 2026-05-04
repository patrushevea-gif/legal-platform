import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#edf3f8",
        panel: "#f8fbfd",
        ink: "#102033",
        muted: "#60758b",
        line: "#d3dee8",
        accent: "#0f4c81",
        success: "#157347",
      },
      boxShadow: {
        panel: "0 12px 30px rgba(16, 32, 51, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
