type ColorArray = [number, number, number, number] // 格式: [255, 255, 255, 255]
type HexColor = `#${string}` // 格式: #RRGGBB 或 #RGB
type RgbaColor = `rgba(${number}, ${number}, ${number}, ${number | string})` // 格式: rgba(255, 255, 255, 1)

// 定义支持三种格式的联合类型
type ColorValue = ColorArray | HexColor | RgbaColor

export interface ColorProps {
  value: ColorValue
  readonly?: boolean
  disabled?: boolean
  invalid?: boolean
  hidden?: boolean
  onChange?: (event: Event) => void
  onConfirm?: (event: Event) => void
  onCancel?: (event: Event) => void
}
