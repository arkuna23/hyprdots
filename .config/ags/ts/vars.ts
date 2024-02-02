import App from "resource:///com/github/Aylur/ags/app.js";
import { readFile } from "resource:///com/github/Aylur/ags/utils.js";

export const WinClassRename = (() => {
    const classes = JSON.parse(readFile(`${App.configDir}/config/class.json`));
    return (name: string) => {
        const cls = classes[name];
        return cls ? cls : name
    }
})()

export const PX_PER_REM = 16;

export const AnimationDuration = {
    State: 200,
    Hover: 120,
    Click: 50,
    Scroll: 80,
}