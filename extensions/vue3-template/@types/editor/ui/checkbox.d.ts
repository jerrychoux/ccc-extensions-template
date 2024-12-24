export interface CheckboxProps {
  value?: boolean
  readonly?: boolean
  disabled?: boolean
  invalid?: boolean
  hidden?: boolean
  onChange?: (event: Event) => void
  onConfirm?: (event: Event) => void
}
