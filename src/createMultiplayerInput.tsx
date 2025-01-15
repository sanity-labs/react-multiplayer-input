import {
  type ComponentProps,
  type ComponentType,
  type MutableRefObject,
  PureComponent,
  type RefObject,
} from 'react'

import {captureCursor, type Cursor, restoreCursor} from './utils/cursor'

type State = never
type ValidElementType = HTMLTextAreaElement | HTMLInputElement

export type UpdateSnapshot = {
  cursor: Cursor
}

// MAX_BITS / 2
// see https://github.com/sanity-io/diff-match-patch/blob/main/src/patch/constants.ts#L2
const padLength = 16

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
>(
  Component: WrappedComponent,
): ComponentType<
  ReturnedComponentProps<WrappedComponent> & {
    elementRef?: RefObject<ValidElementType | null>
  }
> {
  type Props = ReturnedComponentProps<WrappedComponent> & {
    elementRef?: RefObject<ValidElementType | null>
  }

  return class MultiplayerInput extends PureComponent<Props, State> {
    #inputRef: ValidElementType | null = null
    #selectionAnchor: number | null = null

    componentDidMount() {
      document.addEventListener('mouseup', this.#handleMouseUp)
      this.#inputRef?.addEventListener('mousedown', this.#handleMouseDown)
      this.#inputRef!.selectionStart = this.#inputRef!.selectionStart! + 1
      this.#inputRef!.selectionStart = this.#inputRef!.selectionStart! - 1
    }

    #handleMouseDown = () => {
      this.#inputRef?.addEventListener('selectionchange', this.#sampleSelectionOnce)
    }

    #sampleSelectionOnce = () => {
      this.#selectionAnchor = this.#inputRef!.selectionStart
      this.#inputRef?.removeEventListener('selectionchange', this.#sampleSelectionOnce)
    }

    #handleMouseUp = () => {
      this.#selectionAnchor = null
    }

    componentWillUnmount() {
      document.removeEventListener('mouseup', this.#handleMouseUp)
      this.#inputRef?.removeEventListener('mousedown', this.#handleMouseDown)
      this.#inputRef?.removeEventListener('selectionchange', this.#sampleSelectionOnce)
    }

    getSnapshotBeforeUpdate(prevProps: Props): UpdateSnapshot | null {
      const {value: prevValue} = prevProps
      const {value: nextValue} = this.props
      if (prevValue === nextValue || !this.#inputRef) {
        return null
      }
      const cursor = captureCursor(this.#inputRef, {
        padLength,
        anchor: this.#selectionAnchor!,
      })
      return cursor ? {cursor} : null
    }

    componentDidUpdate(prevProps: Props, prevState: State, snapshot: UpdateSnapshot | undefined) {
      if (snapshot?.cursor && this.#inputRef) {
        restoreCursor(this.#inputRef, snapshot.cursor, {
          padLength,
          matchDistance: 1000,
          matchThreshold: 0.8,
        })
        // adjust selection anchor
        this.#selectionAnchor =
          snapshot.cursor.direction === 'none' || snapshot.cursor.direction === 'forward'
            ? this.#inputRef!.selectionStart
            : this.#inputRef!.selectionEnd
      }
    }

    setRef = (element: ValidElementType | null) => {
      if (this.props.elementRef) {
        ;(this.props.elementRef as MutableRefObject<ValidElementType | null>).current = element
      }
      this.#inputRef = element
    }

    render() {
      return <Component {...(this.props as any)} ref={this.setRef} />
    }
  }
}
