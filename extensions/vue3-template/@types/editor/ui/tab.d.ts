export interface TabProps {
  class?: string
  value?: string
  disabled?: boolean
  underline?: boolean
  onChange?: (event: Event) => void
  onConfirm?: (event: Event) => void
}
