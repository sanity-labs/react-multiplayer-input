import ReactDOM from 'react-dom/client'

import {Root} from './Root'
import {Router} from './Router'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Root>
    <Router />
  </Root>,
)
