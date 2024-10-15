interface Panel {
  title: string
  type: 'dockable' | 'simple'
  main: string
}

interface PackageJson {
  panels: { [key: string]: Panel }
}

const packageJson = Editor.Package.getPackages({ name: __EXTENSION_NAME__ }).find(
  (value) => value.name === __EXTENSION_NAME__
)!.info as unknown as PackageJson

export const getPanelConfig = (key: string): Panel => {
  return packageJson.panels[key]
}
