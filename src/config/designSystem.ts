/**
 * Northern Armor - Design System Configuration
 * "The Cold Front" — High-Contrast Functionalism
 */

// ============================================================================
// COLOR PALETTE — "The Cold Front"
// ============================================================================

export const colors = {
  // Dark theme backgrounds
  background: {
    primary: '#0d1117',      // Carbon Black — deep foundation
    secondary: '#161b22',    // Elevated surface
    tertiary: '#21262d',     // Raised surface
    light: '#30363d',        // Slate Grey — borders, cards, dividers
  },

  // Surface colors (armored layers)
  surface: {
    glass: 'rgba(48, 54, 61, 0.2)',
    glassLight: 'rgba(48, 54, 61, 0.3)',
    glassMedium: 'rgba(48, 54, 61, 0.4)',
    glassDark: 'rgba(13, 17, 23, 0.6)',
  },

  // Tactical Blue accent (primary action color)
  accent: {
    primary: '#1f6feb',      // Tactical Blue
    light: '#388bfd',
    dark: '#1158c7',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#1f6feb',
  },

  // Neutral grays
  gray: {
    50: '#f0f6fc',
    100: '#c9d1d9',
    200: '#b1bac4',
    300: '#8b949e',
    400: '#6e7681',
    500: '#484f58',
    600: '#30363d',
    700: '#21262d',
    800: '#161b22',
    900: '#0d1117',
  },

  // Text colors
  text: {
    primary: '#f0f6fc',      // Ghost White
    secondary: '#c9d1d9',
    tertiary: '#8b949e',
    muted: '#6e7681',
    accent: '#1f6feb',       // Tactical Blue
  },

  // Border colors
  border: {
    light: '#30363d',
    medium: '#484f58',
    dark: '#6e7681',
    accent: '#1f6feb',
  },

  // Shadows and overlays
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.4)',
    xl: 'rgba(0, 0, 0, 0.6)',
  },

  // Gradient definitions
  gradient: {
    tacticalButton: 'linear-gradient(180deg, #2563eb 0%, #1f6feb 100%)',
    darkToTransparent: 'linear-gradient(180deg, rgba(13, 17, 23, 1) 0%, rgba(13, 17, 23, 0.8) 100%)',
    glassmorphic: 'linear-gradient(135deg, rgba(48, 54, 61, 0.3) 0%, rgba(48, 54, 61, 0.1) 100%)',
    accentGlow: 'linear-gradient(135deg, rgba(31, 111, 235, 0.3) 0%, rgba(31, 111, 235, 0.1) 100%)',
  },
} as const;

// ============================================================================
// BORDER RADIUS — Sharp Edges (Tactical, max 6px)
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '3px',
  base: '4px',
  md: '6px',
  lg: '6px',
  xl: '6px',
  '2xl': '6px',
  full: '9999px',
  card: '6px',
  largeCard: '6px',
  button: '6px',
  input: '6px',
  modal: '6px',
  circle: {
    sm: '2rem',
    md: '3rem',
    lg: '4rem',
    xl: '6rem',
    '2xl': '8rem',
  },
} as const;

// ============================================================================
// SPACING SCALE
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  80: '20rem',
  96: '24rem',
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  '2xl': '4rem',
  '3xl': '6rem',
} as const;

// ============================================================================
// TYPOGRAPHY — "The Precision Cut"
// ============================================================================

export const typography = {
  fontFamily: {
    base: '"Inter Tight", "Inter", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", "Roboto Mono", Consolas, monospace',
  },

  fontSize: {
    xs: { size: '0.75rem', lineHeight: '1rem' },
    sm: { size: '0.875rem', lineHeight: '1.25rem' },
    base: { size: '1rem', lineHeight: '1.5rem' },
    lg: { size: '1.125rem', lineHeight: '1.75rem' },
    xl: { size: '1.25rem', lineHeight: '1.75rem' },
    '2xl': { size: '1.5rem', lineHeight: '2rem' },
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' },
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' },
    '5xl': { size: '3rem', lineHeight: '1.2' },
    '6xl': { size: '3.75rem', lineHeight: '1.2' },
    '7xl': { size: '4.5rem', lineHeight: '1.2' },
  },

  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    command: '0.15em',
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  styles: {
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
      textTransform: 'uppercase' as const,
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 800,
      lineHeight: '1.3',
      letterSpacing: '-0.025em',
      textTransform: 'uppercase' as const,
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: '1.4',
      letterSpacing: '0em',
      textTransform: 'uppercase' as const,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: '1.4',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: '1.5',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: '1.5',
    },
    body: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: '1.5',
    },
    bodySmall: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: '1.25',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: '1rem',
      letterSpacing: '0.025em',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: '1.25',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: '1.5',
      letterSpacing: '0.05em',
    },
    buttonSmall: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: '1.25',
      letterSpacing: '0.05em',
    },
  },
} as const;

// ============================================================================
// SHADOWS & EFFECTS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.15)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
  glass: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
  glassSmall: '0 4px 15px 0 rgba(0, 0, 0, 0.3)',
  glassLarge: '0 15px 35px 0 rgba(0, 0, 0, 0.5)',
  tacticalGlow: '0 0 30px rgba(31, 111, 235, 0.3)',
  tacticalGlowSmall: '0 0 15px rgba(31, 111, 235, 0.2)',
  tacticalGlowLarge: '0 0 50px rgba(31, 111, 235, 0.4)',
} as const;

// ============================================================================
// BACKDROP & BLUR EFFECTS
// ============================================================================

export const effects = {
  backdrop: {
    none: 'none',
    blur: 'blur(10px)',
    blurMd: 'blur(12px)',
    blurLg: 'blur(16px)',
  },
  glassmorphic: {
    light: 'backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);',
    medium: 'backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);',
    heavy: 'backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);',
  },
  transition: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    elasticOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
  notification: 1090,
  max: 9999,
} as const;

// ============================================================================
// COMPONENT-SPECIFIC STYLES
// ============================================================================

export const componentStyles = {
  card: {
    base: {
      background: colors.surface.glass,
      border: `1px solid ${colors.border.light}`,
      borderRadius: borderRadius.card,
      padding: spacing.md,
      backdropFilter: 'blur(10px)',
      boxShadow: shadows.glass,
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    hover: {
      background: colors.surface.glassLight,
      border: `1px solid ${colors.border.medium}`,
      boxShadow: shadows.glassLarge,
      transform: 'translateY(-2px)',
    },
    active: {
      border: `2px solid ${colors.accent.primary}`,
      boxShadow: shadows.tacticalGlow,
    },
  },

  button: {
    base: {
      borderRadius: borderRadius.button,
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.fontSize.base.size,
      fontWeight: typography.fontWeight.semibold,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      letterSpacing: '0.05em',
    },
    primary: {
      background: colors.gradient.tacticalButton,
      color: colors.text.primary,
      boxShadow: shadows.tacticalGlow,
    },
    primaryHover: {
      boxShadow: shadows.tacticalGlowLarge,
      transform: 'scale(1.02)',
    },
    secondary: {
      background: colors.surface.glassMedium,
      color: colors.text.primary,
      border: `1px solid ${colors.border.light}`,
    },
    secondaryHover: {
      background: colors.surface.glassDark,
      border: `1px solid ${colors.border.medium}`,
    },
  },

  input: {
    base: {
      background: colors.surface.glass,
      border: `1px solid ${colors.border.light}`,
      borderRadius: borderRadius.input,
      padding: `${spacing.sm} ${spacing.md}`,
      color: colors.text.primary,
      fontSize: typography.fontSize.base.size,
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    focus: {
      borderColor: colors.accent.primary,
      boxShadow: `0 0 0 3px ${colors.accent.primary}20`,
      outline: 'none',
    },
    disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      backgroundColor: colors.background.tertiary,
    },
  },

  progressCircle: {
    background: colors.surface.glass,
    trackColor: `${colors.accent.primary}40`,
    fillColor: colors.accent.primary,
    glowColor: colors.accent.primary,
  },

  badge: {
    borderRadius: borderRadius.full,
    padding: `${spacing['1']} ${spacing['2']}`,
    fontSize: typography.fontSize.xs.size,
    fontWeight: typography.fontWeight.semibold,
  },

  statCard: {
    background: colors.surface.glass,
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.largeCard,
    padding: spacing.lg,
    backdropFilter: 'blur(10px)',
    boxShadow: shadows.glass,
  },

  modal: {
    background: colors.background.secondary,
    border: `1px solid ${colors.border.light}`,
    borderRadius: borderRadius.modal,
    boxShadow: shadows['2xl'],
    backdropFilter: 'blur(5px)',
  },
} as const;

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

export const animations = {
  fadeIn: {
    duration: effects.transition.base,
    easing: effects.easing.out,
  },
  slideUp: {
    duration: effects.transition.base,
    easing: effects.easing.out,
  },
  slideDown: {
    duration: effects.transition.base,
    easing: effects.easing.out,
  },
  scaleIn: {
    duration: effects.transition.base,
    easing: effects.easing.elasticOut,
  },
  pulse: {
    duration: '2s',
    easing: effects.easing.inOut,
  },
  spin: {
    duration: '1s',
    easing: effects.easing.linear,
  },
} as const;

// ============================================================================
// THEME EXPORT
// ============================================================================

export const theme = {
  colors,
  borderRadius,
  spacing,
  typography,
  shadows,
  effects,
  breakpoints,
  zIndex,
  componentStyles,
  animations,
} as const;

export default theme;
