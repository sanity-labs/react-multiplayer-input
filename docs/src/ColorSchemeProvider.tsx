import {studioTheme, ThemeProvider} from '@sanity/ui'
import {createContext, type ReactNode, useContext, useMemo, useState} from 'react'

type Scheme = 'dark' | 'light' | 'auto'

const ColorSchemeContext = createContext<{scheme: Scheme; setScheme: (next: Scheme) => void}>({
  scheme: 'auto',
  setScheme: () => {},
})

export function ColorSchemeProvider({children}: {children: ReactNode}) {
  const prefersDarkMode = useColorScheme()
  const [scheme, setScheme] = useState<Scheme>(prefersDarkMode ? 'dark' : 'auto')
  const value = useMemo(() => ({scheme, setScheme}), [scheme])
  return (
    <ColorSchemeContext.Provider value={value}>
      <ThemeProvider theme={studioTheme} scheme={scheme === 'auto' ? undefined : scheme}>
        {children}
      </ThemeProvider>
    </ColorSchemeContext.Provider>
  )
}

export function useColorScheme(): [Scheme, (scheme: Scheme) => void] {
  const {scheme, setScheme} = useContext(ColorSchemeContext)
  return [scheme, setScheme]
}
