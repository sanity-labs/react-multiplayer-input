import {type ComponentProps, createRef, PureComponent} from 'react'

import {MAX_BITS} from './diff-match-patch/patch/constants'
import {captureCursor, type Cursor, restoreCursor} from './utils/cursor'

type Props = ComponentProps<'input'>
type State = never

export type UpdateSnapshot = {
  cursor: Cursor
}

const padLength = MAX_BITS / 2

export class MultiplayerInput extends PureComponent<Props> {
  private inputRef = createRef<HTMLInputElement>()

  getSnapshotBeforeUpdate(prevProps: Props): UpdateSnapshot | undefined {
    const {value: prevValue} = prevProps
    const {value: nextValue} = this.props
    if (prevValue === nextValue || !this.inputRef.current) {
      return
    }
    const cursor = captureCursor(this.inputRef.current, {padLength})
    return cursor ? {cursor} : undefined
  }

  componentDidUpdate(prevProps: Props, prevState: State, snapshot: UpdateSnapshot | undefined) {
    if (snapshot?.cursor && this.inputRef.current) {
      restoreCursor(this.inputRef.current, snapshot.cursor, {
        padLength,
        matchDistance: 1000,
        matchThreshold: 0.8,
      })
    }
  }

  render() {
    return <input ref={this.inputRef} {...this.props} />
  }
}
