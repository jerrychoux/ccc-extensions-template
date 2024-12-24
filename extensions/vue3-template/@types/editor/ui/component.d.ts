export interface ComponentProps {
  class?: string
  droppable?: boolean
  value?: string
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  onChange: (event: Event) => void
  onConfirm: (event: Event) => void
  onCancel: (event: Event) => void
}
