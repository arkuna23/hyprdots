import { monitorScss } from './utils'
import { Bar } from './bar/main'
import App from 'resource:///com/github/Aylur/ags/app.js'
import PowerMenu, { openPowerMenu } from './power/main'

monitorScss();
globalThis.openPowerMenu = openPowerMenu;

export default {
    windows: [
        Bar()
    ],
    icons: `${App.configDir}/assets/icons`
}