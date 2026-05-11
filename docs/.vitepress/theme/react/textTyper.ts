function triggerInputEvent(input: HTMLInputElement | HTMLTextAreaElement, nextValue: string) {
  const setter = Object.getOwnPropertyDescriptor(input.constructor.prototype, 'value')?.set
  setter?.call(input, nextValue)
  input.dispatchEvent(new Event('input', {bubbles: true}))
}

function splitAt(str: string, index: number): [string, string] {
  return [str.substring(0, index), str.substring(index + 1)]
}

export function startTyping(
  input: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  delay: (char: string) => number,
  onEnd: () => void,
) {
  let current = 0
  let timerId = setTimeout(write, 0)

  function write() {
    const cursor = input.selectionStart || 0
    const [before, after] = splitAt(input.value || '', cursor + 1)
    const char = text[current]
    const next = (char === '\b' ? before.slice(0, -1) : before + char) + (after || '')
    triggerInputEvent(input, next)
    current++
    if (current < text.length) {
      timerId = setTimeout(write, delay(char!))
    } else {
      onEnd()
    }
  }

  return () => {
    clearTimeout(timerId)
  }
}
