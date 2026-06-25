export type ColorTokens = {
  primary: string
  sidebar: string
  bg: string
  surface: string
  textBase: string
  textSecondary: string
  textMuted: string
  textDisabled: string
  border: string
  // triage — clinical signal, neutral palette (not alarm-bright)
  triageGreenBg: string
  triageGreenText: string
  triageYellowBg: string
  triageYellowText: string
  triageRedBg: string
  triageRedText: string
  // solid badge dots in lists
  badgeGreen: string
  badgeYellow: string
  badgeRed: string
}

export const lightColors: ColorTokens = {
  primary: '#48A9B2',
  sidebar: '#48A9B2',
  bg: '#F2F2F7',        // Apple primary background
  surface: '#FFFFFF',
  textBase: '#1D1D1F',  // Apple primary label
  textSecondary: '#3C3C43',
  textMuted: '#6E6E73', // Apple tertiary label
  textDisabled: '#ADADB2',
  border: '#D1D1D6',    // Apple separator
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
  primary: '#57BDC1',
  sidebar: '#57BDC1',
  bg: '#000000',        // Apple true black
  surface: '#1C1C1E',   // Apple dark secondary background
  textBase: '#F5F5F7',  // Apple light primary label
  textSecondary: '#ADADB8',
  textMuted: '#8E8E93', // Apple light tertiary label
  textDisabled: '#48484A',
  border: '#38383A',    // Apple dark separator
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
