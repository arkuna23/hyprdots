import { Widget } from "resource:///com/github/Aylur/ags/widget.js";
import { Gdk } from "ts/imports";

const PowerMenuBox = () => {
    const screen = Gdk.Screen.get_default();
    return Widget.Box({
        class_names: ['power-bg'],
        width_request: screen.get_width(),
        height_request: screen.get_height(),
    })
}

const PowerMenu = (monitor = 0) => {
    return Widget.Window({
        class_names: ['power-win'],
        name: `power-layer-${monitor}`,
        exclusivity: 'ignore',
        layer: 'overlay',
        anchor: ['bottom'],
        popup: true,
        monitor,
        child: PowerMenuBox(),
        click_through: false
    })
}

export default PowerMenu