import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Gtk from 'gi://Gtk?version=3.0';
import Gdk from 'gi://Gdk';
import {exec} from 'resource:///com/github/Aylur/ags/utils.js';
import {Spacing, asyncSleep, onFirstDrawAction} from 'ts/utils';
import {AnimationDuration, PX_PER_REM} from 'ts/vars';
import {AgsWindow} from 'ts/imports';
import {hyprland} from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import {EmptyCursor} from 'ts/utils';

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
                async on_primary_click() {
                    (win.child as any).class_names = ['power-bg', 'closing'];
                    win.get_window()?.set_cursor(EmptyCursor);
                    await asyncSleep(200);
                    action();
                }
            }),
            Widget.Label({
                class_names: ['power-label'],
                label
            })
        ]
    });
};

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
                MenuButton('Suspend', 'weather-clear-night-symbolic', win, () => {
                    exec('loginctl lock-session');
                    exec('systemctl suspend');
                }),
                MenuButton('Hibernate', 'weather-few-clouds-night-symbolic', win, () => {
                    exec('loginctl lock-session');
                    exec('systemctl hibernate');
                })
            ]
        }),
        setup(self) {
            onFirstDrawAction(win, () => (self.reveal_child = true));
        }
    });
};

const PowerMenuBg = (win: AgsWindow) => {
    return Widget.Box({
        class_names: ['power-bg'],
        width_request: win.width_request,
        height_request: win.height_request,
        orientation: Gtk.Orientation.VERTICAL,
        children: [Spacing(), PowerMenuBox(win)]
    });
};

const PowerMenu = (monitor = 0) =>
    Widget.Window({
        class_names: ['power-win'],
        name: `power-layer-${monitor}`,
        exclusivity: 'ignore',
        layer: 'overlay',
        anchor: ['top', 'bottom', 'left', 'right'],
        monitor,
        setup(self: AgsWindow) {
            self.child = PowerMenuBg(self);
        },
        click_through: false,
        keymode: 'exclusive'
    } as any);

export const openPowerMenu = (() => {
    return () => {
        let win = globalThis['powermenu'];
        if (win) return;
        win = PowerMenu(hyprland.active.monitor.id);
        win.on('key-press-event', (_, event: Gdk.Event) => {
            if (event.get_keyval()[1] === Gdk.KEY_Escape) win.close();
        }).on('destroy', () => (globalThis['powermenu'] = undefined));
        globalThis['powermenu'] = win;
        win.show_all();
    };
})();

export const closePowerMenu = () => {
    const win = globalThis['powermenu'];
    if (win) {
        win.close();
        globalThis['powermenu'] = undefined;
    }
};

export default PowerMenu;
