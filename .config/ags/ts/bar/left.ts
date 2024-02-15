import { hyprland } from "resource:///com/github/Aylur/ags/service/hyprland.js";
import { Widget } from "resource:///com/github/Aylur/ags/widget.js";
import { Spacing } from "ts/utils";
import { WinClassRename as ClientClassRename } from "ts/vars";
import MediaBar from "./mediabar";

export const WinTitle = () => {
    const title = Widget.Box({
        class_names: ['win-title'],
        vertical: true,
        children: [
            Widget.Label({
                class_name: 'class',
                max_width_chars: 10,
                truncate: 'end',
                xalign: 0
            }).bind('label', hyprland.active.client, 'class', cls => ClientClassRename(cls) || '~'),
            Widget.Label({ 
                class_name: 'title',
                max_width_chars: 20,
                xalign: 0,
                truncate: 'end'
            }).bind('label', hyprland.active.client, 'title', title => title || 'no focus')
        ] 
    });
    return Widget.EventBox({
        child: title,
        class_name: 'win-title-box'
    })
}

export const BarLeft = () => Widget.Box({
    class_name: 'left',
    children: [
        WinTitle(), Spacing(), MediaBar()
    ]
})