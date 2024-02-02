import Widget from "resource:///com/github/Aylur/ags/widget.js"
import { BarRight } from './right'
import { BarLeft } from "./left"
import { BarCenter } from "./center"

export const Bar = (monitor = 0) => Widget.Window(
    {
        name: `bar-${monitor}`,
        monitor,
        anchor: ['top', 'left', 'right'],
        exclusivity: 'exclusive',
        class_name: 'bar-win',
        child: Widget.CenterBox({
            class_name: 'bar',
            start_widget: BarLeft(),
            center_widget: BarCenter(),
            end_widget: BarRight()
        })
    }
)