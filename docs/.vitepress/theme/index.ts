import DefaultTheme from 'vitepress/theme'
import {onContentUpdated, type Theme} from 'vitepress'

import {restorePreferred, setupCodeGroupSync} from './codeGroupSync'
import Demo from './components/Demo.vue'
import './style.css'
import 'virtual:group-icons.css'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({app}) {
    app.component('Demo', Demo)
    if (typeof window !== 'undefined') {
      setupCodeGroupSync()
    }
  },
  setup() {
    onContentUpdated(() => {
      restorePreferred()
    })
  },
}

export default theme
