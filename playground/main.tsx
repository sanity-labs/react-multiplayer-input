import {Card} from '@sanity/ui'
import {useState} from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import {Root} from './Root'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Root>
    <Router />
  </Root>,
)

function Router() {
  const [route, setRoute] = useState('home')
  return (
    <Card margin={1} padding={4} shadow={2} radius={2} overflow="auto">
      <App />
    </Card>
  )
}
