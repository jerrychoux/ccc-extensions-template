import path, { join } from 'path'
import { existsSync, readdirSync, statSync } from 'fs'
import { getPanelConfig } from './package'

function findDockFrameShadowRoot(): ShadowRoot | null {
  const dockFrame = document.querySelector('dock-frame#dock')
  if (!dockFrame) {
    warn('can not find <dock-frame id="dock">')
    return null
  }

  if (!dockFrame.shadowRoot) {
    warn('can not find #shadow-root in <dock-frame id="dock">')
    return null
  }

  return dockFrame.shadowRoot
}

function findPanelFrameShadowRoot(root: Document | ShadowRoot, panelKey: string) {
  const name = panelKey === 'default' ? __EXTENSION_NAME__ : `${__EXTENSION_NAME__}.${panelKey}`
  const panelFrame = root.querySelector(`panel-frame[name="${name}"]`)
  if (!panelFrame) {
    warn(`can not find <panel-frame name="${name}">`)
    return null
  }

  if (!panelFrame.shadowRoot) {
    warn(`can not find #shadow-root in <panel-frame name="${name}">`)
    return null
  }

  return panelFrame.shadowRoot
}

export function addSplitedCssStyles() {
  let shadowRoot = null

  if (getPanelConfig(panelKey).type === 'dockable') {
    shadowRoot = findDockFrameShadowRoot()
    if (!shadowRoot) return
  } else {
    shadowRoot = document
  }

  shadowRoot = findPanelFrameShadowRoot(shadowRoot, panelKey)
  if (!shadowRoot) return

  const entrieName = panelKey + 'Panel'
  const cssFileNames = ['vendor', 'chunk', entrieName]
  cssFileNames.forEach((name) => {
    const extensionPath = Editor.Package.getPath(__EXTENSION_NAME__)!
    const assetsPath = path.resolve(extensionPath, 'dist', 'assets')

    if (!existsSync(assetsPath)) return
    const cssFileRegex = new RegExp(`^${name}\.[A-Za-z0-9_\-]+\.css$`, 'gi')

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
  })
}

function getDockTabsHeight() {
  let dockTabsHeight = 0
  const dockFrameShadowRoot = findDockFrameShadowRoot()
  if (dockFrameShadowRoot) {
    const dockTabs = dockFrameShadowRoot.querySelector('dock-tabs')
    if (dockTabs) {
      dockTabsHeight = parseInt(window.getComputedStyle(dockTabs).getPropertyValue('height'))
    }
  }
  return dockTabsHeight
}

export interface Dock {
  tabs: { height: number }
}

export function getDock(): Dock {
  return {
    tabs: { height: getDockTabsHeight() },
  }
}
