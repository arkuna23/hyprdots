import { Variable } from "resource:///com/github/Aylur/ags/variable.js";
import Service from "resource:///com/github/Aylur/ags/service.js";
import { exec } from "resource:///com/github/Aylur/ags/utils.js";
import { execAsync } from "resource:///com/github/Aylur/ags/utils.js";
import { PspecFlag, PspecType } from "types/utils/gobject";

class _SystemService extends Service {
    static readonly props: { [key: string]: [type: PspecType, handle: PspecFlag] } = {
        'cpu-usage': ['float', 'r'],
        'ram-usage': ['float', 'r'],
        'gpu-usage': ['float', 'r']
    }

    static readonly events: { [key: string]: PspecType[] } = Object.entries(this.props).reduce((result, [key, value]) => {
        result[`${key}-changed`] = [value[0]]
        return result;
    }, {} as { [key: string]: PspecType[] });

    static {
        Service.register(
            this, this.events, this.props
        )
    }

    private onChange(name: string, value: any) {
        this.emit(`${name}-changed`, value);
        this.notify(name);
        this.emit('changed');
    } 

    private _cpu = {
        usage: new Variable(0, {
            listen: [['mpstat', '2'], (out) => {
                if (out.includes('all')) {
                    const usage = (100 - parseFloat(out.split(/\s+/).pop()!)) / 100
                    if (usage !== this.cpu_usage) {
                        this.onChange('cpu-usage', usage);
                    }
                    return usage
                } else 
                    return this.cpu_usage ?? 0
            }]
        })
    }

    private _ram = {
        usage: new Variable(0, {
            listen: [['sar', '-r', '2'], (out) => {
                if (!out.includes('kbmemfree') && out.length > 2) {
                    const usage = parseFloat(out.split(/\s+/)[4]) / 100
                    if (usage !== this.ram_usage) {
                        this.onChange('ram-usage', usage);
                    }
                    return usage
                } else 
                    return this.cpu_usage ?? 0
            }]
        })
    }

    private _gpu: { usage: Variable<number> }

    private _refresh_rate: number;

    private initGpuUsage(): Variable<number> {
        exec("rm -f /tmp/gpu_info");
        execAsync("mkfifo /tmp/gpu_info");
        const usage = new Variable(0, {
            listen: [['cat', '/tmp/gpu_info'], (out) => {
                const match = out.match(/gpu (\d+\.\d+)%/);
                const old = this._gpu.usage.value;
                if (match) {
                    const usage_v = parseFloat(match[1]) / 100;
                    if (usage_v !== old) {
                        this.onChange('gpu-usage', usage_v);
                    }
                    return usage_v;
                } else
                    return old;
            }]
        });
        // AMD GPU
        execAsync("radeontop -i 2 -d /tmp/gpu_info -t 25").then((_) => {
            console.error("radeontop stopped");
        });
        return usage;
    }

    constructor() {
        super();
        const output = exec('xrandr').match(/\s+\d+x\d+\s+(\d+\.\d+)\*\+/);
        this._refresh_rate = output ? Math.ceil(parseFloat(output[1])) : 30;
        this._gpu = {
            usage: this.initGpuUsage()
        }
    }

    get cpu_usage(): number {
        return this._cpu.usage.value;
    }
    get ram_usage(): number {
        return this._ram.usage.value;
    }
    get refresh_rate(): number {
        return this._refresh_rate;
    }
    get gpu_usage(): number {
        return this._gpu.usage.value;
    }

    connect(signal: `${keyof typeof _SystemService.props}_changed` | string | undefined, callback: (_: this, ...args: any[]) => void): number {
        return super.connect(signal, callback);
    }
    
    unbind(id: number) {
        super.disconnect(id)
    }
}

const SystemService = new _SystemService();
export default SystemService;