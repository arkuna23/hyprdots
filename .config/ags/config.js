import GLib from 'gi://GLib'
import Gio from 'gi://Gio'
import App from 'resource:///com/github/Aylur/ags/app.js'
import { execAsync } from 'resource:///com/github/Aylur/ags/utils.js'

const entry = App.configDir + '/ts/main.ts'
const outDir = '/tmp/ags/js'

try {
    console.log("compiling typescript...")
    const jsPath = `${outDir}/main.js`
    if (GLib.file_test(jsPath, GLib.FileTest.EXISTS)) 
        Gio.File.new_for_path(`${outDir}/main.js`).delete(null);
    print(await execAsync([
        'bun', 'build', entry,
        '--outdir', outDir,
        '--external', 'node_modules/*',
        '--external', 'resource://*',
        '--external', 'gi://*',
    ]))
    await import(`file://${outDir}/main.js`)
} catch (err) {
    console.error(err);
}