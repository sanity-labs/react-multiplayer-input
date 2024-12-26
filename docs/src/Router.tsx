import {BrowserRouter, Route, Routes} from 'react-router'

import {GettingStarted} from './pages/GettingStarted'
import {Home} from './pages/Home'

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="getting-started" element={<GettingStarted />}></Route>
      </Routes>
    </BrowserRouter>
  )
}
