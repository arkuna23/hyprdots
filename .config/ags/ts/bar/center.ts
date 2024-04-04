import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { Workspaces } from "./workspaces";

export const BarCenter = () => Widget.Box({
    class_name: 'center',
    children: [Workspaces()],
})