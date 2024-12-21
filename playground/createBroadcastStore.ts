import {fromEvent, map, merge, Subject, tap} from 'rxjs'

interface Options {
  initialValue?: string
}

export type BroadcastStore<T> = {
  subscribe: (callback: () => void) => () => void
  getSnapshot: () => T | undefined
  setSnapshot: (nextValue: T) => void
}

export function createBroadcastStore<T>(name: string, initialValue?: T): BroadcastStore<T> {
  let snapshot = initialValue
  const channel = new BroadcastChannel(name)

  const updates = new Subject<void>()

  const broadcasts = fromEvent<MessageEvent>(channel, 'message').pipe(
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

  function setSnapshot(nextValue: T) {
    snapshot = nextValue
    channel.postMessage(nextValue)
    updates.next()
  }

  return {
    subscribe,
    getSnapshot: () => snapshot,
    setSnapshot,
  }
}
