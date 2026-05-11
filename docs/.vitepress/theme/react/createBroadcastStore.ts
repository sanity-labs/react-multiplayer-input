import {useSyncExternalStore} from 'react'
import {fromEvent, map, merge, share, Subject, tap} from 'rxjs'

export type BroadcastStore<T> = {
  subscribe: (callback: () => void) => () => void
  getSnapshot: () => T
  setValue: (nextValue: T) => void
}

export function createBroadcastStore<T>(name: string, initialValue: T): BroadcastStore<T> {
  let snapshot = initialValue
  const channel = new BroadcastChannel(name)

  const updates = new Subject<void>()

  const broadcasts = fromEvent<MessageEvent>(channel, 'message').pipe(
    tap((event) => {
      snapshot = event.data
    }),
    map((): void => undefined),
    share(),
  )

  const subscribe = (callback: () => void) => {
    const sub = merge(updates, broadcasts).subscribe(callback)
    return () => {
      sub.unsubscribe()
    }
  }

  function setValue(nextValue: T) {
    snapshot = nextValue
    channel.postMessage(nextValue)
    updates.next()
  }

  return {
    subscribe,
    getSnapshot: () => snapshot,
    setValue,
  }
}

export function useBroadcastValue<T>(store: BroadcastStore<T>): [T, (nextValue: T) => void] {
  return [useSyncExternalStore(store.subscribe, store.getSnapshot), store.setValue]
}
