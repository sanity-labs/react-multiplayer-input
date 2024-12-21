import {Button, Card, Flex} from '@sanity/ui'
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
    <Card padding={3}>
      <Flex gap={2}>
        <Button mode="ghost" onClick={() => setRoute('home')} text="Home" />
        <Button mode="ghost" onClick={() => setRoute('blank')} text="Blank" />
      </Flex>
      <Card marginY={1} padding={4} shadow={2} radius={2} overflow="auto">
        <App />
      </Card>
    </Card>
  )
}
