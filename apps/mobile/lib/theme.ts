export type ColorTokens = {
  primary: string
  primaryText: string
  primarySoft: string
  sidebar: string
  bg: string
  surface: string
  surfaceRaised: string
  textBase: string
  textSecondary: string
  textMuted: string
  textDisabled: string
  border: string
  btnFill: string
  triageGreenBg: string
  triageGreenText: string
  triageYellowBg: string
  triageYellowText: string
  triageRedBg: string
  triageRedText: string
  badgeGreen: string
  badgeYellow: string
  badgeRed: string
}

export const lightColors: ColorTokens = {
  primary: '#0E9594',        // clinical teal — brand
  primaryText: '#FFFFFF',    // white text on the teal button
  primarySoft: 'rgba(14,149,148,0.14)', // soft teal chip behind icons (works on white)
  sidebar: '#2A2418',        // web brand-sidebar
  bg: '#FFFFFF',             // all-white canvas on phone
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',  // inputs / raised cards — white
  textBase: '#1D1D1F',
  textSecondary: '#3C3C43',
  textMuted: '#6E6E73',
  textDisabled: '#ADADB2',
  border: '#E8E4DA',         // warm-tinted separator
  btnFill: '#E4DFD7',        // neutral secondary button fill
  triageGreenBg: '#EEF9F3',
  triageGreenText: '#3B8C5E',
  triageYellowBg: '#FEF3E7',
  triageYellowText: '#A8580A',
  triageRedBg: '#FBF1F0',
  triageRedText: '#A84545',
  badgeGreen: '#52A075',
  badgeYellow: '#C97A25',
  badgeRed: '#C07272',
}

export const darkColors: ColorTokens = {
  primary: '#0E9594',        // clinical teal — brand (dark mode)
  primaryText: '#FFFFFF',
  primarySoft: 'rgba(14,149,148,0.20)', // soft teal chip behind icons (dark)
  sidebar: '#1C1C1E',
  bg: '#000000',
  surface: '#1C1C1E',
  surfaceRaised: '#2C2C2E',
  textBase: '#F5F5F7',
  textSecondary: '#ADADB8',
  textMuted: '#8E8E93',
  textDisabled: '#48484A',
  border: '#38383A',
  btnFill: '#3A3A3C',        // neutral secondary button fill (dark)
  triageGreenBg: '#0C2818',
  triageGreenText: '#62D094',
  triageYellowBg: '#261500',
  triageYellowText: '#E8924A',
  triageRedBg: '#250C0C',
  triageRedText: '#D97878',
  badgeGreen: '#62D094',
  badgeYellow: '#E8924A',
  badgeRed: '#D97878',
}

/**
 * Home screen "monochrome dark glass" skin.
 * Near-black canvas, translucent glassy cards, hairline light borders — the
 * surfaces stay monochrome, while active/accent elements (icons, avatar, active
 * states) use the brand orange. Triage/badge semantics are inherited from
 * darkColors so the red/yellow/green status pops stay intact.
 */
export const homeMonoColors: ColorTokens = {
  ...darkColors,
  primary: '#0E9594', // clinical teal — active/accent elements
  primaryText: '#FFFFFF',
  primarySoft: 'rgba(14,149,148,0.20)', // soft teal chip behind icons
  bg: '#0A0A0A',
  surface: 'rgba(255,255,255,0.055)', // glassy card fill over the near-black canvas
  surfaceRaised: 'rgba(255,255,255,0.09)',
  border: 'rgba(255,255,255,0.10)', // hairline glass edge
}

/**
 * Light counterpart of the Home skin: a soft off-white canvas with clean white
 * glassy cards, hairline edges, and the same teal accent. Used on Home when the
 * phone is in light mode.
 */
export const homeLightColors: ColorTokens = {
  ...lightColors,
  primary: '#0E9594',
  primaryText: '#FFFFFF',
  primarySoft: 'rgba(14,149,148,0.12)',
  bg: '#F4F5F7', // soft canvas so the white cards read as cards
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  border: 'rgba(0,0,0,0.07)', // hairline edge
}
