export interface SectionProps {
  class?: string
  header?: string
  expand?: boolean
  whole?: boolean
  disabled?: boolean
  readonly?: boolean
  onExpand?: (event: Event) => void
  onUiScroll?: (event: Event) => void
}
