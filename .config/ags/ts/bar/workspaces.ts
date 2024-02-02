import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { dispatchWorkspace, onFirstDrawAction } from 'ts/utils';
import { hyprland } from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import AgsButton from 'types/widgets/button';

const WorkspaceBtn = (name: string) => Widget.Button({
    class_name: 'item',
    attribute: name,
    child: Widget.Label({
        class_name: 'label',
        label: name
    }),
    on_primary_click: () => dispatchWorkspace(name)
})

export const Workspaces = () => Widget.Box({
    class_name: 'workspace',
    attribute: {
        workspaces: new Map<String, AgsButton>(),
        current: new Set<String>(),
        init: false,
        add(name: string | undefined) {
            if (!this.init || !name) return;
            const ws = hyprland.getWorkspace(parseInt(name));
            if (!ws) return;
            this.current.add(name);
            this.workspaces.get(name).visible = true;
        },
        remove(name: string | undefined) {
            if (!this.init || !name) return;
            this.current.delete(name);
            this.workspaces.get(name).visible = false;
        }
    },
    setup: (self) => {
        for (let i = 1; i <= 10; i++) {
            const name = i.toString();
            const wsBtn = WorkspaceBtn(name);
            self.add(wsBtn);
            self.attribute.workspaces.set(name, wsBtn);
        }
        onFirstDrawAction(self, () => {
            const keys = new Set<string>(hyprland.workspaces.map(ws => ws.name));
            self.attribute.workspaces.forEach((btn: AgsButton, name: string) => {
                if (!keys.has(name))
                    btn.visible = false;
            });
            self.attribute.init = true;
        })
        self.hook(hyprland, (_, name) => self.attribute.add(name), 'workspace-added')
            .hook(hyprland, (_, name) => self.attribute.remove(name), 'workspace-removed')
    }
})