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
  primary: '#F2B705',        // Honey Gold — matches web brand primary
  primaryText: '#1A1407',    // dark text on gold button
  primarySoft: 'rgba(242,183,5,0.12)', // soft gold chip behind icons (works on white)
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
  primary: '#FFC93C',        // brighter gold for dark mode — matches web dark primary
  primaryText: '#1A1407',
  primarySoft: 'rgba(255,201,60,0.16)', // soft gold chip behind icons (dark)
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
