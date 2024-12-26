import {type ReactNode} from 'react'

import {ColorSchemeProvider} from './ColorSchemeProvider'

export function Root({children}: {children: ReactNode}) {
  return <ColorSchemeProvider>{children}</ColorSchemeProvider>
}
