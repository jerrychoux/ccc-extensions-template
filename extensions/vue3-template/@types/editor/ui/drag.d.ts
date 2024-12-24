export interface DragItemProps {
  class?: string
  style?: string
  type?: string
  types?: string
  value?: string
  additional?: boolean
  draging?: boolean
  onDragStart?: (event: Event) => void
  onDragEnd?: (event: Event) => void
}

export interface DragAreaProps {
  class?: string
  style?: string
  type?: string
  types?: string
  additional?: boolean
  draging?: boolean
  onDragStart?: (event: Event) => void
  onDragEnd?: (event: Event) => void
  onDrag?: (event: Event) => void
}
