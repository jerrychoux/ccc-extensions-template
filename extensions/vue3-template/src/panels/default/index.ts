import { createApp, App } from 'vue'

import style from './style.css?raw'
import template from './index.vue'
import path, { join } from 'path'
import { existsSync, readdirSync, statSync } from 'fs'

const entrieName = 'defaultPanel'
const panelDataMap = new WeakMap<any, App>()

function findPanelFrameShadowRoot(): ShadowRoot | null {
  const dockFrame = document.querySelector('dock-frame#dock')
  if (!dockFrame) return null

  const dockShadowRoot = dockFrame.shadowRoot
  if (!dockShadowRoot) return null

  const panelFrame = dockShadowRoot.querySelector('panel-frame[name="vue3-template"]')
  if (!panelFrame) return null

  return panelFrame.shadowRoot
}

function addSplitedCssStyles() {
  const shadowRoot = findPanelFrameShadowRoot()
  if (!shadowRoot) return

  const cssFileRegex = new RegExp(`^${entrieName}\.[A-Za-z0-9]+\.css$`, 'gi')
  const extensionPath = Editor.Package.getPath(__EXTENSION_NAME__)!
  const assetsPath = path.resolve(extensionPath, 'dist', 'assets')

  if (!existsSync(assetsPath)) return

  const matchFiles = readdirSync(assetsPath)
    .filter((file) => statSync(join(assetsPath, file)).isFile() && cssFileRegex.test(file))
    .map((file) => join(assetsPath, file))

  matchFiles.forEach((href) => {
    // Create a <link> element
    const link = document.createElement('link')
    // Set attributes for the <link> element
    link.rel = 'stylesheet'
    link.href = href // URL to your CSS file
    // Append the <link> element to shadowRoot
    shadowRoot.appendChild(link)
  })
}

/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
  listeners: {
    show() {
      console.log('show')
    },
    hide() {
      console.log('hide')
    },
  },
  template: '<div id=app></div>',
  style,
  $: {
    app: '#app',
  },
  methods: {
    hello() {
      console.log('[cocos-panel-html.default]: hello')
    },
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
