export interface ButtonProps {
  class?: string
  type?: 'default' | 'danger' | 'success' | 'primary' | 'warning' | 'icon'
  disabled?: boolean
  outline?: boolean
  loading?: boolean
  onConfirm?: (event: Event) => void
}
