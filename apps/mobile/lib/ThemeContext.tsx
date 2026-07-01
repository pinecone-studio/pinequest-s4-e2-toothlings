import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useColorScheme } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { lightColors, darkColors, type ColorTokens } from './theme'

// 'system' follows the phone; 'light'/'dark' override it (persisted).
export type ThemePref = 'system' | 'light' | 'dark'

const PREF_KEY = 'theme_pref'
const isPref = (v: string | null): v is ThemePref =>
  v === 'system' || v === 'light' || v === 'dark'

type ThemeContextValue = { colors: ColorTokens; dark: boolean }
type ThemePrefValue = { pref: ThemePref; setPref: (p: ThemePref) => void }

// Exported so a subtree can override the palette (e.g. the Home screen's
// monochrome-dark skin) by wrapping children in <ThemeContext.Provider>.
export const ThemeContext = createContext<ThemeContextValue>({ colors: lightColors, dark: false })

// Kept separate so the ThemeContext shape (consumed & re-provided by the Home
// skin) stays exactly { colors, dark }.
const ThemePrefContext = createContext<ThemePrefValue>({ pref: 'system', setPref: () => {} })

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const scheme = useColorScheme()
  const [pref, setPrefState] = useState<ThemePref>('system')

  useEffect(() => {
    SecureStore.getItemAsync(PREF_KEY).then((v) => {
      if (isPref(v)) setPrefState(v)
    })
  }, [])

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p)
    SecureStore.setItemAsync(PREF_KEY, p)
  }, [])

  const dark = pref === 'system' ? scheme === 'dark' : pref === 'dark'
  const colors = dark ? darkColors : lightColors

  return (
    <ThemePrefContext.Provider value={{ pref, setPref }}>
      <ThemeContext.Provider value={{ colors, dark }}>{children}</ThemeContext.Provider>
    </ThemePrefContext.Provider>
  )
}

export const useTheme = (): ThemeContextValue => useContext(ThemeContext)
export const useThemePref = (): ThemePrefValue => useContext(ThemePrefContext)
