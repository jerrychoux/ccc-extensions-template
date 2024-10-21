export interface DragItemProps {
  class?: string
  style?: string
  type?: string
  types?: string
  value?: string
  additional?: boolean
  draging?: boolean
  onDragStart?: (value: string) => void
  onDragEnd?: (value: string) => void
}

export interface DragAreaProps {
  class?: string
  style?: string
  type?: string
  types?: string
  additional?: boolean
  draging?: boolean
  onDragStart?: (value: string) => void
  onDragEnd?: (value: string) => void
  onDrag?: (value: string) => void
}
