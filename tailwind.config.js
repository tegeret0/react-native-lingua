/** @type {import('tailwindcss').Config} */
const tokens = require("./src/theme/tokens.json");

const fontSize = Object.fromEntries(
  Object.entries(tokens.typography).map(([name, style]) => [
    name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
    [
      `${style.fontSize}px`,
      {
        lineHeight: `${Number((style.fontSize * style.lineHeight).toFixed(2))}px`,
      },
    ],
  ]),
);

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./global.css"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: tokens.colors.primary,
          "deep-purple": tokens.colors.deepPurple,
          blue: tokens.colors.blue,
          green: tokens.colors.green,
        },
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        streak: tokens.colors.streak,
        error: tokens.colors.error,
        info: tokens.colors.info,
        "text-primary": tokens.colors.textPrimary,
        "text-secondary": tokens.colors.textSecondary,
        border: tokens.colors.border,
        surface: tokens.colors.surface,
        background: tokens.colors.background,
      },
      fontFamily: {
        sans: ["Poppins-Regular"],
        poppins: ["Poppins-Regular"],
        "poppins-medium": ["Poppins-Medium"],
        "poppins-semibold": ["Poppins-SemiBold"],
        "poppins-bold": ["Poppins-Bold"],
      },
      fontSize,
      borderRadius: {
        card: `${tokens.radii.card}px`,
        control: `${tokens.radii.control}px`,
        swatch: `${tokens.radii.swatch}px`,
        pill: `${tokens.radii.pill}px`,
      },
    },
  },
  plugins: [],
};
