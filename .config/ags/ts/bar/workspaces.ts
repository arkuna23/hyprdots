import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { dispatchWorkspace, onFirstDrawAction } from 'ts/utils';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';

const WorkspaceBtn = (id: number) => Widget.Button({
    class_name: 'item',
    vpack: 'center',
    child: Widget.Label({
        class_name: 'label',
        label: (id%10).toString()
    }),
    on_primary_click: () => dispatchWorkspace(id)
})

export const Workspaces = () => Widget.Box({
    class_name: 'workspace',
    attribute: {
        workspaces: {},
        init: false,
        last: null,
        add(name: string | undefined) {
            if (!this['init'] || !name) return;
            const ws = Hyprland.getWorkspace(parseInt(name));
            if (!ws) return;
            const btn = this['workspaces'][name];
            if (!btn.class_names.includes('current'))
                this['workspaces'][name].class_names = ['item', 'active'];
        },
        remove(name: string | undefined) {
            if (!this['init'] || !name) return;
            this['workspaces'][name].class_names = ['item'];
        },
        active(name: string | undefined) {
            if (!this['init'] || !name) return;
            if (this['last'])
                this['workspaces'][this['last']].class_names = ['item', 'active'];
            this['workspaces'][name].class_names = ['item', 'current'];
            this['last'] = name;
        }
    },
    setup: (self) => {
        for (let i = 1; i <= 10; i++) {
            const name = i.toString();
            const wsBtn = WorkspaceBtn(i);
            self.add(wsBtn);
            self.attribute.workspaces[name] = wsBtn;
        }
        onFirstDrawAction(self, () => {
            const keys = new Set<string>(Hyprland.workspaces.map(ws => ws.name));
            for (let i = 1; i <= 10; i++) {
                const name = i.toString();
                if (keys.has(name))
                    self.attribute.workspaces[name].class_names = ['item', 'active'];
            }
            self.attribute.init = true;
        })
        self.hook(Hyprland, (_, name) => self.attribute.add(name), 'workspace-added')
            .hook(Hyprland, (_, name) => self.attribute.remove(name), 'workspace-removed')
            .hook(Hyprland.active.workspace, () => self.attribute.active(Hyprland.active.workspace.name))
    }
})