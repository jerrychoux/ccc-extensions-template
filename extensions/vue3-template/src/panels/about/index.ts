import { createApp, App } from 'vue'

import '../../utils/logger'
import '../../utils/panel'
import { addSplitedCssStyles } from '../../utils/dom'

import style from './style.css?raw'
import template from './index.vue'

panelKey = 'about'

const panelDataMap = new WeakMap<any, App>()

/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
  listeners: {
    show() {
      log('show')
    },
    hide() {
      log('hide')
    },
  },
  template: '<div id=app></div>',
  style,
  $: {
    app: '#app',
  },
  ready() {
    addSplitedCssStyles()

    if (this.$.app) {
      const app = createApp(template)
      app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-')
      app.mount(this.$.app)
      panelDataMap.set(this, app)
    }
  },
  beforeClose() {},
  close() {
    const app = panelDataMap.get(this)
    if (app) {
      app.unmount()
    }
  },
})
