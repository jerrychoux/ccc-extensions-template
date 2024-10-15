let _panelKey = ''

Object.defineProperty(globalThis, 'panelKey', {
  get() {
    return _panelKey
  },
  set(value: string) {
    if (panelKey) {
      throw new Error('panelKey has already been set and cannot be modified.')
    }
    _panelKey = value
  },
  configurable: false,
  enumerable: true,
})
