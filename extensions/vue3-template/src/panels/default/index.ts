import { createApp, App } from 'vue'

import style from './style.css?raw'
import template from './index.vue'
import path, { join } from 'path'
import { existsSync, readdirSync, statSync } from 'fs'
import '../../utils/logger'

const entrieName = 'defaultPanel'
const panelDataMap = new WeakMap<any, App>()

function findDockFrameShadowRoot(): ShadowRoot | null {
  const dockFrame = document.querySelector('dock-frame#dock')
  if (!dockFrame) {
    console.warn('can not find <dock-frame id="dock">')
    return null
  }

  return dockFrame.shadowRoot
}

function findPanelFrameShadowRoot(): ShadowRoot | null {
  const dockShadowRoot = findDockFrameShadowRoot()
  if (!dockShadowRoot) {
    console.warn('can not find #shadow-root in <dock-frame id="dock">')
    return null
  }

  const panelFrame = dockShadowRoot.querySelector(`panel-frame[name="${__EXTENSION_NAME__}"]`)
  if (!panelFrame) {
    console.warn(`can not find <panel-frame name="${__EXTENSION_NAME__}">`)
    return null
  }

  return panelFrame.shadowRoot
}

function addSplitedCssStyles() {
  const shadowRoot = findPanelFrameShadowRoot()
  if (!shadowRoot) return

  const cssFileRegex = new RegExp(`^${entrieName}\.[A-Za-z0-9_\-]+\.css$`, 'gi')
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
  methods: {
    hello() {
      log('[cocos-panel-html.default]: hello')
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
