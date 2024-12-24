export interface AssetProps {
  class?: string
  droppable?: string
  placeholder?: string
  value?: string
  invalid?: boolean
  readonly?: boolean
  disabled?: boolean
  onChange?: (event: Event) => void
  onConfirm?: (event: Event) => void
  onPreview?: () => void
}
