import { monitorScss } from './utils'
import { Bar } from './bar/main'
import App from 'resource:///com/github/Aylur/ags/app.js'
import PowerMenu, { closePowerMenu, openPowerMenu } from './power/main'

monitorScss();
globalThis.openPowerMenu = openPowerMenu;
globalThis.closePowerMenu = closePowerMenu;

export default {
    windows: [
        Bar()
    ],
    icons: `${App.configDir}/assets/icons`
}