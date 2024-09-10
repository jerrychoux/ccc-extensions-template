import path, { join } from 'path'
import { existsSync, readdirSync, statSync } from 'fs'

function findDockFrameShadowRoot(): ShadowRoot | null {
  const dockFrame = document.querySelector('dock-frame#dock')
  if (!dockFrame) {
    warn('can not find <dock-frame id="dock">')
    return null
  }

  return dockFrame.shadowRoot
}

function findPanelFrameShadowRoot(): ShadowRoot | null {
  const dockShadowRoot = findDockFrameShadowRoot()
  if (!dockShadowRoot) {
    warn('can not find #shadow-root in <dock-frame id="dock">')
    return null
  }

  const panelFrame = dockShadowRoot.querySelector(`panel-frame[name="${__EXTENSION_NAME__}"]`)
  if (!panelFrame) {
    warn(`can not find <panel-frame name="${__EXTENSION_NAME__}">`)
    return null
  }

  return panelFrame.shadowRoot
}

export function addSplitedCssStyles(entrieName: string) {
  const shadowRoot = findPanelFrameShadowRoot()
  if (!shadowRoot) return

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

export function getDockTabHeight() {
  let dockTabHeight = 0
  const dockFrameShadowRoot = findDockFrameShadowRoot()
  if (dockFrameShadowRoot) {
    const dockTabs = dockFrameShadowRoot.querySelector('dock-tabs')
    if (dockTabs) {
      dockTabHeight = parseInt(window.getComputedStyle(dockTabs).getPropertyValue('height'))
    }
  }
  return dockTabHeight
}
