// Persists the selected code-group tab (npm / pnpm / yarn / bun) to
// localStorage and syncs the choice across all code groups on the page.
// Adapted from mikrojs/mikrojs.

const STORAGE_KEY = 'react-multiplayer-input-pm'
const PM_LABELS = new Set(['npm', 'pnpm', 'yarn', 'bun'])

function getPreferred(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function setPreferred(label: string) {
  try {
    localStorage.setItem(STORAGE_KEY, label)
  } catch {
    // ignore
  }
}

function activateTabInGroup(group: Element, label: string) {
  const inputs = group.querySelectorAll<HTMLInputElement>('input')
  const labels = group.querySelectorAll<HTMLLabelElement>('.tabs label')
  const blocks = group.querySelector('.blocks')
  if (!blocks) return

  for (let i = 0; i < labels.length; i++) {
    const labelEl = labels[i]
    if (labelEl?.textContent?.trim() !== label) continue
    const input = inputs[i]
    if (input) input.checked = true
    for (const child of Array.from(blocks.children)) {
      child.classList.remove('active')
    }
    const block = blocks.children[i]
    if (block) block.classList.add('active')
    return
  }
}

function syncAll(label: string) {
  for (const group of document.querySelectorAll('.vp-code-group')) {
    activateTabInGroup(group, label)
  }
}

export function setupCodeGroupSync() {
  if (typeof window === 'undefined') return

  window.addEventListener('click', (e) => {
    const input = (e.target as HTMLElement)?.closest?.(
      '.vp-code-group input',
    ) as HTMLInputElement | null
    if (!input) return

    const group = input.closest('.vp-code-group')
    if (!group) return

    const label = group.querySelector<HTMLLabelElement>(`label[for="${input.id}"]`)
    const text = label?.textContent?.trim()
    if (!text || !PM_LABELS.has(text)) return

    setPreferred(text)
    requestAnimationFrame(() => syncAll(text))
  })
}

export function restorePreferred() {
  const preferred = getPreferred()
  if (preferred) {
    requestAnimationFrame(() => syncAll(preferred))
  }
}
