let _panelKey = ''
// Reflect.deleteProperty(globalThis, 'panelKey')
if (!Object.prototype.hasOwnProperty.call(globalThis, 'panelKey')) {
  Object.defineProperty(globalThis, 'panelKey', {
    get() {
      return _panelKey
    },
    set(value: string) {
      if (panelKey && panelKey !== value) {
        throw new Error('panelKey has already been set and cannot be modified.')
      }
      _panelKey = value
    },
  })
}
