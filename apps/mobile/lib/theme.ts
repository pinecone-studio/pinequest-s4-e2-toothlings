export type ColorTokens = {
  primary: string
  primaryText: string
  sidebar: string
  bg: string
  surface: string
  surfaceRaised: string
  textBase: string
  textSecondary: string
  textMuted: string
  textDisabled: string
  border: string
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
  sidebar: '#2A2418',        // web brand-sidebar
  bg: '#F3F1EA',             // warm cream canvas — matches web bg
  surface: '#FFFFFF',
  surfaceRaised: '#F7F5EE',  // inputs / raised cards
  textBase: '#1D1D1F',
  textSecondary: '#3C3C43',
  textMuted: '#6E6E73',
  textDisabled: '#ADADB2',
  border: '#E8E4DA',         // warm-tinted separator
  triageGreenBg: '#EEF8F3',
  triageGreenText: '#2A7D4F',
  triageYellowBg: '#FAF6E4',
  triageYellowText: '#8A6500',
  triageRedBg: '#FAF0F0',
  triageRedText: '#B83838',
  badgeGreen: '#2A7D4F',
  badgeYellow: '#8A6500',
  badgeRed: '#B83838',
}

export const darkColors: ColorTokens = {
  primary: '#FFC93C',        // brighter gold for dark mode — matches web dark primary
  primaryText: '#1A1407',
  sidebar: '#1C1C1E',
  bg: '#000000',
  surface: '#1C1C1E',
  surfaceRaised: '#2C2C2E',
  textBase: '#F5F5F7',
  textSecondary: '#ADADB8',
  textMuted: '#8E8E93',
  textDisabled: '#48484A',
  border: '#38383A',
  triageGreenBg: '#0C2818',
  triageGreenText: '#5DC98B',
  triageYellowBg: '#251A00',
  triageYellowText: '#E2AF3C',
  triageRedBg: '#270D0D',
  triageRedText: '#E07070',
  badgeGreen: '#5DC98B',
  badgeYellow: '#E2AF3C',
  badgeRed: '#E07070',
}
