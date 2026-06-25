import { createContext, useContext, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import { lightColors, darkColors, type ColorTokens } from './theme'

type ThemeContextValue = { colors: ColorTokens; dark: boolean }

const ThemeContext = createContext<ThemeContextValue>({ colors: lightColors, dark: false })

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const scheme = useColorScheme()
  const dark = scheme === 'dark'
  const colors = dark ? darkColors : lightColors
  return <ThemeContext.Provider value={{ colors, dark }}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextValue => useContext(ThemeContext)
