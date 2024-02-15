import { Widget } from "resource:///com/github/Aylur/ags/widget.js";
import Gtk from "gi://Gtk";
import { Gdk, GdkPixbuf } from "ts/imports";
import { exec } from "resource:///com/github/Aylur/ags/utils.js";
import { Spacing, asyncSleep, onFirstDrawAction } from "ts/utils";
import AgsWindow from "types/widgets/window";
import { AnimationDuration, PX_PER_REM } from "ts/vars";

const emptyCursor = Gdk.Cursor.new_from_pixbuf(
    Gdk.Display.get_default(), GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, true, 8, 1, 1), 0, 0
)

const MenuButton = (label: string, icon: string, win: AgsWindow, action: () => void) => {
    return Widget.Box({
        class_names: ['power-btn-box'],
        orientation: Gtk.Orientation.VERTICAL,
        children: [
            Widget.Button({
                class_names: ['power-btn'],
                child: Widget.Icon({
                    class_names: ['power-icon'],
                    size: PX_PER_REM * 3,
                    icon
                }),
                on_primary_click() {
                    (win.child as any).class_names = ['power-bg', 'closing'];
                    win.get_window().set_cursor(emptyCursor);
                    setTimeout(async () => {
                        action();
                        await asyncSleep(100);
                        win.close();
                    }, 1000);
                }
            }),
            Widget.Label({
                class_names: ['power-label'],
                label
            })
        ]
    })
}

const PowerMenuBox = (win: AgsWindow) => {
    return Widget.Revealer({
        reveal_child: false,
        transition: 'slide_up',
        transition_duration: AnimationDuration.State,
        child: Widget.Box({
            class_names: ['power-menu'],
            orientation: Gtk.Orientation.HORIZONTAL,
            halign: Gtk.Align.CENTER,
            children: [
                MenuButton('Power Off', 'system-shutdown-symbolic', win, () => exec('shutdown now')),
                MenuButton('Reboot', 'system-reboot-symbolic', win, () => exec('reboot')),
                MenuButton('Suspend', 'weather-clear-night-symbolic', win, () => exec('systemctl suspend')),
                MenuButton('Hibernate', 'weather-few-clouds-night-symbolic', win, () => exec('systemctl hibernate')),
            ]
        }),
        setup(self) {
            onFirstDrawAction(self, () => self.reveal_child = true);
        },
    })

}

const PowerMenuBg = (win: AgsWindow) => {
    const screen = Gdk.Screen.get_default();
    return Widget.Box({
        class_names: ['power-bg'],
        width_request: screen.get_width(),
        height_request: screen.get_height(),
        orientation: Gtk.Orientation.VERTICAL,
        children: [
            Spacing(), PowerMenuBox(win)
        ]
    })
}

const PowerMenu = (monitor = 0) => {
    const win = Widget.Window({
        class_names: ['power-win'],
        name: `power-layer-${monitor}`,
        exclusivity: 'ignore',
        layer: 'overlay',
        popup: true,
        monitor,
        setup(self: AgsWindow) {
            self.child = PowerMenuBg(self);
        },
        click_through: false,
        keymode: 'exclusive'
    } as any);
    return win;
}

export default PowerMenu