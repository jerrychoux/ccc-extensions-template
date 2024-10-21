export interface CheckboxProps {
  value?: boolean
  readonly?: boolean
  disabled?: boolean
  invalid?: boolean
  hidden?: boolean
  onChange?: (value: string) => void
  onConfirm?: (value: string) => void
}
