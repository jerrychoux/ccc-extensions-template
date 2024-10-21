export interface ButtonProps {
  class?: string
  type?: 'default' | 'danger' | 'success' | 'primary' | 'warning' | 'icon'
  disable?: boolean
  outline?: boolean
  loading?: boolean
  onConfirm: () => void
}
