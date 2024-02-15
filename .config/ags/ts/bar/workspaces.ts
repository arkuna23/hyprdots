import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { dispatchWorkspace, onFirstDrawAction } from 'ts/utils';
import { hyprland } from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import AgsButton from 'types/widgets/button';

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
        workspaces: new Map<String, AgsButton>(),
        init: false,
        last: null,
        add(name: string | undefined) {
            if (!this.init || !name) return;
            const ws = hyprland.getWorkspace(parseInt(name));
            if (!ws) return;
            this.workspaces.get(name).class_names = ['item', 'active'];
        },
        remove(name: string | undefined) {
            if (!this.init || !name) return;
            this.workspaces.get(name).class_names = ['item'];
        },
        active(name: string | undefined) {
            if (!this.init || !name) return;
            if (this.last)
                this.workspaces.get(this.last).class_names = ['item', 'active'];
            this.workspaces.get(name).class_names = ['item', 'current'];
            this.last = name;
        }
    },
    setup: (self) => {
        for (let i = 1; i <= 10; i++) {
            const name = i.toString();
            const wsBtn = WorkspaceBtn(i);
            self.add(wsBtn);
            self.attribute.workspaces.set(name, wsBtn);
        }
        onFirstDrawAction(self, () => {
            const keys = new Set<string>(hyprland.workspaces.map(ws => ws.name));
            self.attribute.workspaces.forEach((btn: AgsButton, name: string) => {
                if (keys.has(name))
                    btn.class_names = ['item', 'active'];
            });
            self.attribute.init = true;
        })
        self.hook(hyprland, (_, name) => self.attribute.add(name), 'workspace-added')
            .hook(hyprland, (_, name) => self.attribute.remove(name), 'workspace-removed')
            .hook(hyprland.active.workspace, () => self.attribute.active(hyprland.active.workspace.name))
    }
})