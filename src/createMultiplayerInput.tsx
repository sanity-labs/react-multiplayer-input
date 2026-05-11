import {type ComponentProps, type ComponentType, PureComponent, type Ref} from 'react'

import {captureCursor, type Cursor, restoreCursor} from './utils/cursor'

type ValidElementType = HTMLTextAreaElement | HTMLInputElement

export type UpdateSnapshot = {
  cursor: Cursor
}

// MAX_BITS / 2
// see https://github.com/sanity-io/diff-match-patch/blob/main/src/patch/constants.ts#L2
const padLength = 16

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange#exceptions
type InputProps<C extends 'input'> = Omit<ComponentProps<C>, 'type'> & {
  type: 'text' | 'search' | 'tel' | 'url' | 'password' | 'email'
}

type ReturnedComponentProps<C extends 'textarea' | 'input' | ComponentType> = C extends 'input'
  ? InputProps<C>
  : C extends 'textarea'
    ? ComponentProps<C>
    : Omit<ComponentProps<C>, 'value'> & {
        value: string
      }

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

export function createMultiplayerInput<
  WrappedComponent extends 'textarea' | 'input' | ComponentType<any>,
>(Component: WrappedComponent): ComponentType<ReturnedComponentProps<WrappedComponent>> {
  type OuterProps = ReturnedComponentProps<WrappedComponent> & {
    ref?: Ref<ValidElementType>
  }

  type InnerProps = ReturnedComponentProps<WrappedComponent> & {
    elementRef?: Ref<ValidElementType>
  }

  /**
   * Implements cursor preservation by taking a snapshot of the cursor position before update and restoring it after update.
   * Needs to be a class component as long as there is no getSnapshotBeforeUpdate equivalent for function components.
   * See https://react.dev/reference/react/Component#getsnapshotbeforeupdate
   */
  class InnerMultiplayerInput extends PureComponent<InnerProps> {
    #inputRef: ValidElementType | null = null
    #selectionAnchor: number | null = null

    componentDidMount() {
      document.addEventListener('mouseup', this.#handleMouseUp)
      this.#inputRef?.addEventListener('mousedown', this.#handleMouseDown)
    }

    componentWillUnmount() {
      document.removeEventListener('mouseup', this.#handleMouseUp)
      this.#inputRef?.removeEventListener('mousedown', this.#handleMouseDown)
      this.#inputRef?.removeEventListener('selectionchange', this.#sampleSelectionOnce)
    }

    #handleMouseDown = () => {
      this.#inputRef?.addEventListener('selectionchange', this.#sampleSelectionOnce)
    }

    #sampleSelectionOnce = () => {
      if (!this.#inputRef) return
      this.#selectionAnchor = this.#inputRef.selectionStart
      this.#inputRef.removeEventListener('selectionchange', this.#sampleSelectionOnce)
    }

    #handleMouseUp = () => {
      this.#selectionAnchor = null
    }

    getSnapshotBeforeUpdate(prevProps: InnerProps): UpdateSnapshot | null {
      if (prevProps.value === this.props.value || !this.#inputRef) {
        return null
      }
      const cursor = captureCursor(this.#inputRef, {
        padLength,
        anchor: this.#selectionAnchor ?? this.#inputRef.selectionStart ?? 0,
      })
      return cursor ? {cursor} : null
    }

    componentDidUpdate(
      _prevProps: InnerProps,
      _prevState: unknown,
      snapshot: UpdateSnapshot | null,
    ) {
      if (!snapshot?.cursor || !this.#inputRef) return

      restoreCursor(this.#inputRef, snapshot.cursor, {
        padLength,
        matchDistance: 1000,
        matchThreshold: 0.8,
      })

      // Adjust selection anchor to match where the caret ended up
      this.#selectionAnchor =
        snapshot.cursor.direction === 'none' || snapshot.cursor.direction === 'forward'
          ? this.#inputRef.selectionStart
          : this.#inputRef.selectionEnd
    }

    #setRef = (element: ValidElementType | null) => {
      this.#inputRef = element
      assignRef(this.props.elementRef, element)
    }

    render() {
      const {elementRef: _elementRef, ...rest} = this.props
      return <Component {...(rest as any)} ref={this.#setRef} />
    }
  }

  // Thin wrapper that forwards `ref` to the inner class as `elementRef`.
  // React 19 passes refs as a regular prop, so no forwardRef needed.
  function MultiplayerInput({ref, ...rest}: OuterProps) {
    return <InnerMultiplayerInput {...(rest as any)} elementRef={ref} />
  }

  return MultiplayerInput as ComponentType<ReturnedComponentProps<WrappedComponent>>
}
