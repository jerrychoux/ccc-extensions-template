export interface InputProps {
  class?: string
  value?: string
  'show-clear'?: boolean
  password?: boolean
  'auto-select'?: boolean
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  placeholder?: string
  hidden?: boolean
  onChange?: (event: Event) => void
  onConfirm?: (event: Event) => void
  onCancel?: (event: Event) => void
}

export interface NumInputProps extends Omit<InputProps, 'show-clear' | 'password' | 'auto-select'> {
  value?: number
  unit?: string
  label?: string
  preci?: number
  step?: number
  max?: number
  min?: number
  onUnitClick?: (event: Event) => void
}
