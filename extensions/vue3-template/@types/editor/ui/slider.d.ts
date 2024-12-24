export interface SliderProps {
  value?: string
  'hide-num-input'?: boolean
  preci?: boolean
  step?: string
  max?: string
  min?: string
  placeholder?: string
  readonly?: boolean
  disabled?: boolean
  invalid?: boolean
  hidden?: boolean
  onChange?: (event: Event) => void
  onConfirm?: (event: Event) => void
  onCancel?: (event: Event) => void
}
