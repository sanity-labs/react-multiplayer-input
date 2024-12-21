import {type ComponentProps, createRef, PureComponent} from 'react'

import {match} from './match/match'

type Props = ComponentProps<'textarea'>
type State = never

type Selection = {
  start: number
  end: number
  direction?: 'none' | 'forward' | 'backward'
}

type UpdateSnapshot = {
  selection: Selection
  before: string
  after: string
}

const MATCH_OPTS = {
  threshold: 0.8,
  distance: 1000,
} as const

export class MultiplayerTextArea extends PureComponent<Props> {
  private inputRef = createRef<HTMLTextAreaElement>()

  getSnapshotBeforeUpdate(prevProps: Props, prevState: State): UpdateSnapshot | undefined {
    const {value: prevValue} = prevProps
    const {value: nextValue} = this.props
    if (prevValue === nextValue || !this.inputRef.current) {
      return
    }
    const element = this.inputRef.current

    const nextValueString = String(nextValue)
    const prevValueString = String(prevValue)

    const inputValue = this.inputRef.current.value
    // compute diff between current value and next value

    // Capture the scroll position so we can adjust scroll later.
    const selection = {
      start: element.selectionStart,
      end: element.selectionEnd,
      direction: element.selectionDirection,
    }
    return {
      selection,
      before: inputValue.slice(Math.max(0, selection.start - 25), selection.start),
      after: inputValue.slice(selection.start, Math.min(inputValue.length, selection.start + 25)),
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State, snapshot: UpdateSnapshot | undefined) {
    if (!snapshot || !this.inputRef.current) {
      return
    }
    const {value: currentValue} = this.props
    const currentValueString = String(currentValue)
    const matchBefore = match(
      currentValueString,
      snapshot.before,
      snapshot.selection.start,
      MATCH_OPTS,
    )
    if (matchBefore > -1) {
      const newPos = snapshot.before.length + matchBefore
      this.inputRef.current.setSelectionRange(newPos, newPos)
      return
    }
    const matchAfter = match(
      currentValueString,
      snapshot.after,
      snapshot.selection.start,
      MATCH_OPTS,
    )
    if (matchAfter > -1) {
      const newPos = matchAfter
      this.inputRef.current.setSelectionRange(newPos, newPos)
      return
    }
  }

  render() {
    return <textarea ref={this.inputRef} {...this.props} />
  }
}
