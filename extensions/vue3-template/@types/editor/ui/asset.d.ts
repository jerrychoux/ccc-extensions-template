export interface AssetProps {
  class?: string
  droppable?: string
  placeholder?: string
  value?: string
  invalid?: boolean
  readonly?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
  onConfirm?: (value: string) => void
  onPreview?: () => void
}
