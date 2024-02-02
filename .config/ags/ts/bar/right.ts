import Widget from "resource:///com/github/Aylur/ags/widget.js"
import { exec } from "resource:///com/github/Aylur/ags/utils.js"
import { SysState, SysTray } from "./system"

export const Clock = () => Widget.Box({
    class_name: 'clock',
    vertical: true,
    children: [
        Widget.Label({ 
            class_name: 'time',
            hpack: 'end',
            xalign: 0
        }).poll(
            1000, self => self.label = exec("date +'%H:%M'")
        ),
        Widget.Label({ 
            class_name: 'date',
            hpack: 'end',
            xalign: 0 
        }).poll(
            1000, self => self.label = exec("date '+%Y/%-m/%-d'") 
        )
    ]
})

export const BarRight = () => Widget.Box({
    class_name: 'right',
    hpack: 'end',
    children: [
        SysTray(), SysState(), Clock()
    ]
})