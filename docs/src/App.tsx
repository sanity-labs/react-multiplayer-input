import {Card, Heading, Stack} from '@sanity/ui'
import {MultiplayerInput, MultiplayerTextArea} from 'react-multiplayer-input'

import {createBroadcastStore, useBroadcastValue} from './createBroadcastStore'

const INITIAL = `
foo bar --><-- baz
`

const textInputStore = createBroadcastStore('textinput', INITIAL)
const textareaStore = createBroadcastStore('textarea', INITIAL)

function App() {
  const [inputValue, setInputValue] = useBroadcastValue(textInputStore)
  const [textareaValue, setTextareaValue] = useBroadcastValue(textareaStore)
  return (
    <Card width="fill" height="fill" padding={2}>
      <Stack space={4}>
        <Heading>Text input</Heading>
        <MultiplayerInput
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
        />
        <Heading>Textarea</Heading>
        <MultiplayerTextArea
          value={textareaValue}
          rows={10}
          onChange={(e) => setTextareaValue(e.currentTarget.value)}
        />
      </Stack>
    </Card>
  )
}

export default App
