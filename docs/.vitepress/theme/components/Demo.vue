<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'

const host = ref<HTMLDivElement | null>(null)
let unmount: (() => void) | undefined

onMounted(async () => {
  if (!host.value) return
  const [{createRoot}, {createElement}, {DemoApp}] = await Promise.all([
    import('react-dom/client'),
    import('react'),
    import('../react/DemoApp'),
  ])
  const root = createRoot(host.value)
  root.render(createElement(DemoApp))
  unmount = () => root.unmount()
})

onBeforeUnmount(() => {
  unmount?.()
})
</script>

<template>
  <div ref="host" class="demo-island" />
</template>
