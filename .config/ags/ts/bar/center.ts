import { Widget } from "resource:///com/github/Aylur/ags/widget.js";
import { Workspaces } from "./workspaces";
import { VolumeSlider } from "./audio";
import AudioBar from "./audiobar";
import { Spacing } from "ts/utils";

export const BarCenter = () => Widget.CenterBox({
    class_name: 'center',
    start_widget: Widget.Box({
        children: [
            Spacing(), VolumeSlider()
        ]
    }),
    center_widget: AudioBar(),
    end_widget: Widget.Box({
        children: [
            Workspaces(), Spacing()
        ]
    })
})