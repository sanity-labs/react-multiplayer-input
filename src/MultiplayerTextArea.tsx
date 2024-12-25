import {type ComponentProps, type ComponentType, createRef, PureComponent} from 'react'

import {MAX_BITS} from './diff-match-patch/patch/constants'
import {captureCursor, type Cursor, restoreCursor} from './utils/cursor'

type ValidElementType = HTMLTextAreaElement | HTMLInputElement

type Props<ElementType extends ValidElementType> = (ElementType extends HTMLTextAreaElement
  ? ComponentProps<'textarea'>
  : ComponentProps<'input'>) & {as?: ComponentType}

type State = never

export type UpdateSnapshot = {
  cursor: Cursor
}

const padLength = MAX_BITS / 2

export class MultiplayerTextArea<ElementType extends ValidElementType> extends PureComponent<
  Props<ElementType>
> {
  #inputRef = createRef<ElementType>()
  #selectionAnchor: number | null = null

  componentDidMount() {
    document.addEventListener('mouseup', this.#handleMouseUp)
    this.#inputRef.current?.addEventListener('mousedown', this.#handleMouseDown)
    this.#inputRef.current!.selectionStart = this.#inputRef.current!.selectionStart! + 1
    this.#inputRef.current!.selectionStart = this.#inputRef.current!.selectionStart! - 1
  }

  #handleMouseDown = () => {
    this.#inputRef.current?.addEventListener('selectionchange', this.#sampleSelectionOnce)
  }

  #sampleSelectionOnce = () => {
    this.#selectionAnchor = this.#inputRef.current!.selectionStart
    this.#inputRef.current?.removeEventListener('selectionchange', this.#sampleSelectionOnce)
  }

  #handleMouseUp = () => {
    this.#selectionAnchor = null
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.#handleMouseUp)
    this.#inputRef.current?.removeEventListener('mousedown', this.#handleMouseDown)
    this.#inputRef.current?.removeEventListener('selectionchange', this.#sampleSelectionOnce)
  }

  getSnapshotBeforeUpdate(prevProps: Props<ElementType>): UpdateSnapshot | null {
    const {value: prevValue} = prevProps
    const {value: nextValue} = this.props
    if (prevValue === nextValue || !this.#inputRef.current) {
      return null
    }
    const cursor = captureCursor(this.#inputRef.current, {
      padLength,
      anchor: this.#selectionAnchor!,
    })
    return cursor ? {cursor} : null
  }

  componentDidUpdate(
    prevProps: Props<ElementType>,
    prevState: State,
    snapshot: UpdateSnapshot | undefined,
  ) {
    if (snapshot?.cursor && this.#inputRef.current) {
      restoreCursor(this.#inputRef.current, snapshot.cursor, {
        padLength,
        matchDistance: 1000,
        matchThreshold: 0.8,
      })
      // adjust selection anchor
      this.#selectionAnchor =
        snapshot.cursor.direction === 'none' || snapshot.cursor.direction === 'forward'
          ? this.#inputRef.current!.selectionStart
          : this.#inputRef.current!.selectionEnd
    }
  }

  render() {
    const {as: AsComponent = 'textarea', ...rest} = this.props
    return <AsComponent {...rest} ref={this.#inputRef as any} />
  }
}
