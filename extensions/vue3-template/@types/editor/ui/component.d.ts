export interface ComponentProps {
  class?: string
  droppable?: boolean
  value?: string
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  onChange: (value: string) => void
  onConfirm: (value: string) => void
  onCancel: (value: string) => void
}
