import DefaultTheme from 'vitepress/theme'
import type {Theme} from 'vitepress'

import Demo from './components/Demo.vue'
import './style.css'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({app}) {
    app.component('Demo', Demo)
  },
}

export default theme
