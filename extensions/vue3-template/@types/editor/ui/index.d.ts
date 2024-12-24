import { DefineComponent } from 'vue'
import { AssetProps } from './asset'
import { ButtonProps } from './button'
import { CheckboxProps } from './checkbox'
import { CodeProps } from './code'
import { ColorProps } from './color'
import { ComponentProps } from './component'
import { CurveProps } from './curve'
import { DragItemProps, DragAreaProps } from './drag'
import { TabProps } from './tab'
import { PropProps } from './prop'
import { SectionProps } from './section'
import { SliderProps } from './slider'
import { InputProps, NumInputProps } from './input'

declare module 'vue' {
  export interface GlobalComponents {
    'ui-asset': DefineComponent<AssetProps>
    'ui-button': DefineComponent<ButtonProps>
    'ui-checkbox': DefineComponent<CheckboxProps>
    'ui-code': DefineComponent<CodeProps>
    'ui-color': DefineComponent<ColorProps>
    'ui-component': DefineComponent<ComponentProps>
    'ui-curve': DefineComponent<CurveProps>
    'ui-drag-item': DefineComponent<DragItemProps>
    'ui-drag-area': DefineComponent<DragAreaProps>

    'ui-input': DefineComponent<InputProps>
    'ui-num-input': DefineComponent<NumInputProps>
    'ui-slider': DefineComponent<SliderProps>

    'ui-tab': DefineComponent<TabProps>
    'ui-prop': DefineComponent<PropProps>
    'ui-section': DefineComponent<SectionProps>
  }
}
