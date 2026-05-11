import {
  type ChangeEvent,
  type ComponentProps,
  type ComponentType,
  type Ref,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react'

import {applyDiff} from './utils/applyDiff'

type ValidElementType = HTMLTextAreaElement | HTMLInputElement

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
  if (typeof ref === 'function') ref(value)
  else if (ref) ref.current = value
}

/**
 * Wraps a text input/textarea so remote updates to `value` preserve caret and
 * selection state.
 *
 * The wrapper renders the underlying input as **uncontrolled** (passes
 * `defaultValue`, not `value`) so React never writes `el.value = X` and never
 * snaps the caret. When `value` changes from outside, a layout effect diffs
 * it against the live DOM value and patches via `setRangeText`, which
 * preserves caret and selection per the W3C contract.
 *
 * The consumer-facing API still looks fully controlled — `value` and
 * `onChange` work as expected — but internally the DOM is the source of truth
 * and React's value tracking is bypassed.
 */
export function createMultiplayerInput<
  WrappedComponent extends 'textarea' | 'input' | ComponentType<any>,
>(Component: WrappedComponent): ComponentType<ReturnedComponentProps<WrappedComponent>> {
  type Props = ReturnedComponentProps<WrappedComponent> & {
    ref?: Ref<ValidElementType>
    onChange?: (e: ChangeEvent<ValidElementType>) => void
  }

  function MultiplayerInput(props: Props) {
    const {value, onChange, ref, ...rest} = props as Props & {value: string}

    if (typeof value !== 'string') {
      throw new TypeError(`createMultiplayerInput: \`value\` must be a string, got ${typeof value}`)
    }

    const elementRef = useRef<ValidElementType | null>(null)
    // Captured once on first render. Subsequent prop changes flow through the
    // layout effect below.
    const initialValueRef = useRef(value)
    // True while applyDiff is running, so the change events it emits don't
    // bubble out to the consumer's onChange.
    const applyingRef = useRef(false)
    // Latest ref from the consumer. Held via a ref so #setRef can stay stable
    // across renders even when the consumer passes an inline callback ref.
    const consumerRefRef = useRef(ref)
    consumerRefRef.current = ref

    useLayoutEffect(() => {
      const el = elementRef.current
      if (!el || el.value === value) return
      applyingRef.current = true
      try {
        applyDiff(el, value)
      } finally {
        applyingRef.current = false
      }
    }, [value])

    const handleChange = useCallback(
      (event: ChangeEvent<ValidElementType>) => {
        if (applyingRef.current) return
        onChange?.(event)
      },
      [onChange],
    )

    const setRef = useCallback((element: ValidElementType | null) => {
      elementRef.current = element
      assignRef(consumerRefRef.current, element)
    }, [])

    return (
      // `rest as any`: TypeScript can't prove the residual props are assignable
      // to `Component`'s props after the conditional Omit+intersection in
      // ReturnedComponentProps. Cleaning this up would require redesigning the
      // generic — out of scope for the wrapper's runtime correctness.
      <Component
        {...(rest as any)}
        defaultValue={initialValueRef.current}
        onChange={handleChange}
        ref={setRef}
      />
    )
  }

  return MultiplayerInput as ComponentType<ReturnedComponentProps<WrappedComponent>>
}
