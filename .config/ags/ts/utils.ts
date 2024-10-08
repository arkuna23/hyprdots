import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import {exec, monitorFile} from 'resource:///com/github/Aylur/ags/utils.js';
import {hyprland} from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=3.0';
import AgsIcon, {Icon} from 'types/widgets/icon';
import {BoxProps} from 'types/widgets/box';
import Gdk from 'types/@girs/gdk-3.0/gdk-3.0';
import GdkPixbuf from 'types/@girs/gdkpixbuf-2.0/gdkpixbuf-2.0';

export function getDirChildren(path: string) {
    let iter = Gio.File.new_for_path(path).enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
    let children: string[] = [];
    let curr: Gio.FileInfo | null;
    while ((curr = iter.next_file(null))) {
        children.push(`${path}/${curr.get_name()}`);
    }

    return children;
}

export function monitorScss() {
    try {
        const scssDir = `${App.configDir}/scss`;
        const loadScss = () => {
            console.log('compiling scss...');
            exec(`sassc ${scssDir}/style.scss ${App.configDir}/css/style.css`);
            App.resetCss();
            App.applyCss(`${App.configDir}/css/style.css`);
            console.log('style sheet reloaded');
        };
        loadScss();

        monitorFile(scssDir, (file, event) => {
            const filename = file.get_parse_name();
            if (event === Gio.FileMonitorEvent.CHANGES_DONE_HINT && filename?.endsWith('.scss')) {
                console.log(`${filename} changed, reloading scss`);
                loadScss();
            }
        });
    } catch (e) {
        console.error(`monitor scss error: ${e}`);
        return;
    }
}

export function dispatchWorkspace(id: number) {
    hyprland.message(`dispatch workspace ${id}`);
}

export function Spacing(class_names: string[] = [], props: BoxProps = {}) {
    return Widget.Box({
        ...props,
        class_names: ['spacing', ...class_names],
        hexpand: true,
        vexpand: true
    });
}

export function invisibleBarElement(self: Gtk.Widget) {
    onFirstDrawAction(self, () => (self.visible = false));
}

export const onBarOpenAction = (() => {
    const funcs: (() => void)[] = [];
    hyprland.connect('event', (_, type, data) => {
        if (type === 'openlayer' && data.startsWith('bar')) {
            for (const func of funcs) {
                func();
            }
        }
    });

    return (func: () => void) => {
        funcs.push(func);
    };
})();

export const onFirstDrawAction = (widget: Gtk.Widget, func: () => void, delay: number = 0) => {
    const id = widget.connect('draw', () => {
        setTimeout(func, delay);
        widget.disconnect(id);
        Widget.Icon;
    });
};

export const initIconFromBuf = (icon: Icon<any>, buf: any) => onFirstDrawAction(icon, () => icon.set_from_pixbuf(buf));

export const SCRIPT_DIR = `${App.configDir}/scripts`;

export const asyncSleep = (timeMs: number) => new Promise((resolve) => setTimeout(resolve, timeMs));
export const EmptyCursor = Gdk.Cursor.new_from_pixbuf(Gdk.Display.get_default()!, GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, true, 8, 1, 1), 0, 0);
