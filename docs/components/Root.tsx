import {ThemeProvider} from '@sanity/ui'
import {buildTheme} from '@sanity/ui/theme'
import {type ReactNode} from 'react'

const theme = buildTheme()
export function Root(props: {children?: ReactNode}) {
  return (
    <ThemeProvider theme={theme} scheme="dark">
      {props.children}
    </ThemeProvider>
  )
}
