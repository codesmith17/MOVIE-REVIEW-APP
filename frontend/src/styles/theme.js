// Modern Design System for CineSphere

const theme = {
  // Color Palette - Modern Dark Theme with Vibrant Accents
  colors: {
    // Primary Colors
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9", // Main primary
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },

    // Secondary Colors (Purple/Violet)
    secondary: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7", // Main secondary
      600: "#9333ea",
      700: "#7e22ce",
      800: "#6b21a8",
      900: "#581c87",
    },

    // Accent Colors (Amber/Gold for ratings, highlights)
    accent: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b", // Main accent
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },

    // Success/Error/Warning
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",

    // Neutral/Background Colors
    background: {
      primary: "#0a0e27", // Deep dark blue
      secondary: "#131a35", // Slightly lighter
      tertiary: "#1e293b", // Card backgrounds
      elevated: "#1f2937", // Elevated elements
      hover: "#2d3748", // Hover states
    },

    // Text Colors
    text: {
      primary: "#f8fafc", // Main text
      secondary: "#cbd5e1", // Secondary text
      tertiary: "#94a3b8", // Muted text
      disabled: "#64748b", // Disabled text
      inverse: "#0f172a", // Text on light backgrounds
    },

    // Border Colors
    border: {
      light: "#334155",
      medium: "#475569",
      heavy: "#64748b",
    },

    // Overlay
    overlay: "rgba(0, 0, 0, 0.7)",
    overlayLight: "rgba(0, 0, 0, 0.4)",
  },

  // Gradients
  gradients: {
    primary: "linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)",
    secondary: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
    accent: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    dark: "linear-gradient(180deg, #0a0e27 0%, #131a35 100%)",
    card: "linear-gradient(145deg, #1e293b 0%, #131a35 100%)",
    hero: "linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(19, 26, 53, 0.9) 50%, rgba(30, 41, 59, 0.95) 100%)",
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    glow: "0 0 15px rgba(14, 165, 233, 0.5)",
    glowPurple: "0 0 15px rgba(168, 85, 247, 0.5)",
    glowGold: "0 0 15px rgba(245, 158, 11, 0.5)",
  },

  // Border Radius
  borderRadius: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    "2xl": "1.5rem", // 24px
    full: "9999px",
  },

  // Spacing
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
    "4xl": "6rem", // 96px
  },

  // Typography
  typography: {
    fonts: {
      primary:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      heading: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"Fira Code", "Consolas", "Monaco", monospace',
    },
    sizes: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
      "6xl": "3.75rem", // 60px
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // Transitions
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    slower: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // Breakpoints
  breakpoints: {
    xs: "475px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Z-Index
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export default theme;
