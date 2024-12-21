import {Card, Stack} from '@sanity/ui'
import {useSyncExternalStore} from 'react'
import {fromEvent, map, merge, Subject, tap} from 'rxjs'

import {MultiplayerTextArea} from './MultiplayerTextArea'

interface Options {
  initialValue?: string
}

const createBroadcastStore = (options?: Options) => {
  let snapshot = options?.initialValue
  const bc = new BroadcastChannel('multiplayer_value')

  const updates = new Subject<void>()

  const broadcasts = fromEvent<MessageEvent>(bc, 'message').pipe(
    tap((event) => {
      snapshot = event.data
    }),
    map((): void => undefined),
  )

  const subscribe = (callback: () => void) => {
    const sub = merge(updates, broadcasts).subscribe(callback)
    return () => {
      sub.unsubscribe()
    }
  }

  function set(nextValue: string) {
    snapshot = nextValue
    bc.postMessage(nextValue)
    updates.next()
  }

  return {
    subscribe,
    getSnapshot: () => snapshot,
    set,
  }
}

const INITIAL = `
foo bar --><-- baz
`
const broadcastValueStore = createBroadcastStore({initialValue: INITIAL})

function App() {
  const value = useSyncExternalStore(broadcastValueStore.subscribe, broadcastValueStore.getSnapshot)
  return (
    <Card width="fill" height="fill" padding={2}>
      <Stack space={3}>
        <MultiplayerTextArea
          rows={10}
          cols={100}
          value={value}
          onChange={(e) => broadcastValueStore.set(e.currentTarget.value)}
        />
      </Stack>
    </Card>
  )
}

export default App
