import GdkPixbuf20 from "gi://GdkPixbuf";
import App from "resource:///com/github/Aylur/ags/app.js";
import { readFile } from "resource:///com/github/Aylur/ags/utils.js";

export function getIconPath(name: string, type: 'svg' | 'png' = 'svg') {
    return `${App.configDir}/assets/icons/${name}.${type}`;
}

export interface SvgOptions {
    fill?: string;
    width?: number;
    height?: number;
}

const encoder = new TextEncoder()
export function recolorSvgToBuf(props: SvgOptions & { svg: string }) {
    const loader = new GdkPixbuf20.PixbufLoader();
    const { svg, fill = 'white', width, height } = props;
    let svgStr = svg.replace(/fill=".*?"/g, `fill="${fill}"`)
    if (width)
        svgStr = svgStr.replace(/width=".*?"/g, `width="${width}"`)
    if (height)
        svgStr = svgStr.replace(/height=".*?"/g, `height="${height}"`)
    
    loader.write(encoder.encode(svgStr));
    loader.close();
    
    return loader.get_pixbuf();
}

export interface SvgIconOptions extends SvgOptions {
    name: string;
}

export function recolorSvgIconToBuf(options: SvgIconOptions) {
    const { name } = options;
    return recolorSvgToBuf({ svg: readFile(getIconPath(name)), ...options });
}

const getKey = (options: SvgOptions) => {
    return `${options.fill || 'white'}-${options.width || ''}-${options.height || ''}`;
}

const iconGetter = ((name: string) => {
    const cache = new Map<string, any>();
    return (options?: SvgOptions) => {
        options = options ?? {};
        const key = getKey(options);
        let buf = cache.get(key);
        if (buf) return buf;
        buf = recolorSvgIconToBuf({ name, ...options });
        cache.set(key, buf);
        return buf;
    }
})

const Icons = {
    Cpu: iconGetter('cpu'),
    Ram: iconGetter('memory'),
    Gpu: iconGetter('gpu-card')
}

export default Icons;