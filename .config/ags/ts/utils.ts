import App from 'resource:///com/github/Aylur/ags/app.js'
import { Widget } from 'resource:///com/github/Aylur/ags/widget.js'
import { exec, monitorFile } from 'resource:///com/github/Aylur/ags/utils.js'
import { hyprland } from 'resource:///com/github/Aylur/ags/service/hyprland.js'
import Gio from 'gi://Gio';
import { Gtk } from 'gi://Gtk';
import AgsIcon from 'types/widgets/icon';

export function getDirChildren(path: string) {
    let iter = Gio.File.new_for_path(path).enumerate_children(
        'standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null
    );
    let children: string[] = [];
    let curr: Gio.FileInfo | null;
    while (curr = iter.next_file(null)) {
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
        }
        loadScss();

        monitorFile(scssDir, (file, event) => {
            const filename = file.get_parse_name();
            if (event === Gio.FileMonitorEvent.CHANGES_DONE_HINT && filename?.endsWith('.scss')) {
                console.log(`${filename} changed, reloading scss`);
                loadScss();
            }
        }, 'directory')
    } catch (e) {
        console.error(`monitor scss error: ${e}`)
        return
    }
}

export function dispatchWorkspace(name: string) {
    hyprland.sendMessage(`dispatch workspace ${name}`)
}

export function Spacing() {
    return Widget.Box({ class_name: 'spacing' });
}

export function invisibleBarElement(self: Gtk.Widget) {
    onFirstDrawAction(self, () => self.visible = false)
}

export const onBarOpenAction = (() => {
    const funcs: (() => void)[] = [];
    hyprland.connect('event', (_, type, data) => {
        if (type === 'openlayer' && data.startsWith('bar')) {
            for (const func of funcs) {
                func()
            }
        }
    });

    return (func: () => void) => {
        funcs.push(func)
    };
})()

export const onFirstDrawAction = (widget: Gtk.Widget, func: () => void, delay: number = 0) => {
    const id = widget.connect('draw', () => {
        setTimeout(func, delay);
        widget.disconnect(id);
    });
}

export const initIconFromBuf = (icon: AgsIcon, buf: any) => 
    onFirstDrawAction(icon, () => icon.set_from_pixbuf(buf));

export const SCRIPT_DIR = `${App.configDir}/scripts`;