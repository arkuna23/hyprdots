import {TrayItem, systemTray} from 'resource:///com/github/Aylur/ags/service/systemtray.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import {AnimatedCircularProgress} from 'ts/components/widgets';
import {EaseFunc} from 'ts/services/animation';
import SystemService from 'ts/services/system';
import Icons from 'ts/components/icons';
import {initIconFromBuf} from 'ts/utils';
import {AnimationDuration} from 'ts/vars';
import {AgsBox, AgsButton, AgsLabel, AgsOverlay, AgsStack} from 'ts/imports';
import Gtk from 'gi://Gtk?version=3.0';

const sysTrayItem = (item: TrayItem) =>
    Widget.Button({
        class_name: 'item',
        child: Widget.Icon({class_name: 'icon'}).bind('icon', item, 'icon'),
        on_primary_click: (_, event) => item.activate(event),
        on_secondary_click: (_, event) => item.openMenu(event)
    }).bind('tooltip_markup', item, 'tooltip_markup', (markup) => markup);

type TrayAttribute = {
    items: Map<String, AgsButton>;
    add: (box: AgsBox<TrayAttribute>, id: string) => void;
    remove: (box: AgsBox<TrayAttribute>, id: string) => void;
};

export const SysTray = () =>
    Widget.Box({
        class_name: 'systray',
        attribute: {
            items: new Map<String, AgsButton>(),
            add: (box: AgsBox<{items: Map<string, any>}>, id: string) => {
                const item = systemTray.getItem(id);
                if (!item || box.attribute.items.has(id)) return;
                const tray = sysTrayItem(item);
                box.attribute.items.set(id, tray);
                box.add(tray);
                box.show_all();
            },
            remove: (box: AgsBox<{items: Map<string, any>}>, id: string) => {
                const item = box.attribute.items.get(id);
                if (!item) return;
                box.remove(item);
                box.attribute.items.delete(id);
                box.show_all();
            }
        } as unknown as TrayAttribute,
        setup: (self) => {
            systemTray.connect('added', (_, id) => self.attribute.add(self, id));
            systemTray.connect('removed', (_, id) => self.attribute.remove(self, id));
        }
    });

const SysStateCircle = () =>
    AnimatedCircularProgress(
        Widget.CircularProgress({
            class_names: ['state-circle'],
            rounded: true
        }),
        {
            duration: AnimationDuration.State,
            easing: EaseFunc.easeInQuad
        }
    );

const stateOrder: ('cpu' | 'ram' | 'gpu')[] = ['cpu', 'ram', 'gpu'];
const StateIcons = () => {
    const createIcon = (buf: any) =>
        Widget.Icon({
            class_names: ['state-icon'],
            setup(self) {
                initIconFromBuf(self, buf);
            }
        });
    const stack = Widget.Stack({
        class_names: ['state-icons'],
        transition: 'slide_up_down',
        transition_duration: AnimationDuration.State,
        children: {
            cpu: createIcon(Icons.Cpu()),
            ram: createIcon(Icons.Ram()),
            gpu: createIcon(Icons.Gpu())
        } as {[name: string]: Gtk.Widget}
    });

    return stack;
};

const StateOverlay: () => [AnimatedCircularProgress, AgsStack, AgsLabel, AgsOverlay] = () => {
    const circle = SysStateCircle();
    const stateIcons = StateIcons();
    const label = Widget.Label({
        class_names: ['state-label']
    });
    return [
        circle,
        stateIcons,
        label,
        Widget.Overlay({
            child: circle.bar,
            overlays: [
                Widget.Overlay({
                    child: label,
                    overlays: [stateIcons]
                })
            ],
            attribute: {
                curr: 0,
                change(action: 'up' | 'down') {
                    const {curr} = this as any;
                    const next = (curr + (action === 'up' ? 1 : -1) + stateOrder.length) % stateOrder.length;
                    this['curr'] = next;
                    stateIcons.shown = stateOrder[next];
                    const value = SystemService[`${stateOrder[next]}_usage`];
                    circle.value_animated = value / 100;
                    label.label = `${Math.ceil(value)}%`;
                }
            }
        }).hook(
            SystemService,
            (self) => {
                const value = SystemService[`${stateOrder[self.attribute.curr]}_usage`];
                circle.value_animated = value / 100;
                label.label = `${Math.ceil(value)}%`;
            },
            'changed'
        )
    ];
};

export const SysState = () => {
    const [circle, icons, label, overlay] = StateOverlay();
    return Widget.EventBox({
        class_name: 'sys-state',
        child: overlay,
        on_scroll_down() {
            const child = this.child as AgsOverlay<{change: (arg0: string) => void}>;
            child.attribute.change('up');
        },
        on_scroll_up() {
            const child = this.child as AgsOverlay<{change: (arg0: string) => void}>;
            child.attribute.change('down');
        },
        on_hover() {
            label.class_names = ['state-label', 'hover'];
            icons.class_names = ['state-icons', 'hover'];
        },
        on_hover_lost() {
            label.class_names = ['state-label'];
            icons.class_names = ['state-icons'];
        }
    });
};
