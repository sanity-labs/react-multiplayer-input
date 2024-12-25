import {type ComponentProps, type ComponentType, createRef, PureComponent} from 'react'

import {MAX_BITS} from './diff-match-patch/patch/constants'
import {captureCursor, type Cursor, restoreCursor} from './utils/cursor'

type State = never
type ValidElementType = HTMLTextAreaElement | HTMLInputElement

export type UpdateSnapshot = {
  cursor: Cursor
}

const padLength = MAX_BITS / 2

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange#exceptions
type InputProps<C extends 'input'> = Omit<ComponentProps<C>, 'type'> & {
  type: 'text' | 'search' | 'tel' | 'url' | 'password'
}

type ReturnedComponentProps<C extends 'textarea' | 'input' | ComponentType> = C extends 'input'
  ? InputProps<C>
  : Omit<ComponentProps<C>, 'value'> & {
      value: string
    }

export function createMultiplayerInput<
  WrappedComponent extends 'textarea' | 'input' | ComponentType,
>(Component: WrappedComponent): ComponentType<ReturnedComponentProps<WrappedComponent> & {}> {
  type Props = ReturnedComponentProps<WrappedComponent>

  return class MultiplayerInput extends PureComponent<Props, State> {
    #inputRef = createRef<ValidElementType>()
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

    getSnapshotBeforeUpdate(prevProps: Props): UpdateSnapshot | null {
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

    componentDidUpdate(prevProps: Props, prevState: State, snapshot: UpdateSnapshot | undefined) {
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
      return <Component {...(this.props as any)} ref={this.#inputRef} />
    }
  }
}
