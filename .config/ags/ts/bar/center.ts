import { Widget } from "resource:///com/github/Aylur/ags/widget.js";
import { Workspaces } from "./workspaces";
import { VolumeSlider } from "./audio";
import AudioBar from "./audiobar";
import { Spacing } from "ts/utils";

export const BarCenter = () => Widget.CenterBox({
    class_name: 'center',
    start_widget: Widget.Box({
        children: [
            Spacing(), AudioBar()
        ]
    }),
    center_widget: Workspaces(),
    end_widget: Widget.Box({
        children: [
            VolumeSlider(), Spacing()
        ]
    })
})