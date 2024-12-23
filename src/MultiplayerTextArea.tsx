import {type ComponentProps, type ComponentType, createRef, PureComponent} from 'react'

import {MAX_BITS} from './diff-match-patch/patch/constants'
import {captureCursor, type Cursor, restoreCursor} from './utils/cursor'

type Props = ComponentProps<'textarea'> & {as: ComponentType}
type State = never

export type UpdateSnapshot = {
  cursor: Cursor
}

const padLength = MAX_BITS / 2

export class MultiplayerTextarea extends PureComponent<Props> {
  private inputRef = createRef<HTMLTextAreaElement>()

  getSnapshotBeforeUpdate(prevProps: Props): UpdateSnapshot | null {
    const {value: prevValue} = prevProps
    const {value: nextValue} = this.props
    if (prevValue === nextValue || !this.inputRef.current) {
      return null
    }
    const cursor = captureCursor(this.inputRef.current, {padLength})
    return cursor ? {cursor} : null
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
    const {as: AsComponent = 'textarea', ...rest} = this.props
    return <AsComponent {...rest} ref={this.inputRef} />
  }
}
