import { readableStreamFromReader } from "https://deno.land/std@0.157.0/streams/mod.ts";
import * as path from "https://deno.land/std@0.157.0/path/mod.ts";
import { serve } from "https://deno.land/std@0.157.0/http/server.ts";
import { contentType } from "https://deno.land/std@0.157.0/media_types/mod.ts";

export interface PluginHandler {
    (request: Request): Promise<Response|void> | Response | void
}

export interface Plugin {
    filter: RegExp | void,
    handler: PluginHandler
}

export function createStatic(dir: string) {
    return async function (request: Request): Promise<Response | void> {
        const url = new URL(request.url);
        const filepath = decodeURIComponent(url.pathname);
        let file;
        let _filepath = path.join(dir, filepath);
        try {
            const stat = await Deno.stat(_filepath);
            if (stat.isDirectory) {
                _filepath = path.join(_filepath, "index.html");
            }
            file = await Deno.open(_filepath, { read: true });
            
            const readableStream = readableStreamFromReader(file);

            const ext = path.extname(_filepath)

            const ct = contentType(ext);
            const headers = new Headers()
            if(ct){
                headers.set('Content-Type',ct)
            }
            const response = new Response(readableStream,{
                headers
            });
            return response;
        } catch (_ex) {
            // console.log(_ex)
            // console.log(url.pathname + ' 404');
            return
        }
    }
}

function isHandler(t: any): t is PluginHandler {
    return typeof t === 'function'
}

export default class Server {
    plugins: Plugin[] = []
    constructor() {

    }

    use(handle: PluginHandler): void
    use(exp: string | RegExp, handle: PluginHandler): void
    use(exp: string | RegExp | PluginHandler, handle?: PluginHandler) {
        let _exp: string | RegExp | void;
        let _handle = handle;
        if (isHandler(exp)) {
            _handle = exp
            _exp = void 0
        } else {
            _exp = exp;
            _handle = handle;
        }
        if (!_handle) {
            throw new Error('handle muse be a Function')
        }
        if (typeof _exp === 'string') {
            _exp = new RegExp('^' + exp)
        }
        // console.log(_exp);
        this.plugins.push({
            filter: _exp,
            handler: _handle
        })
    }

    listen(port: number, callback?: () => void) {
        callback?.();
        serve(this.handler.bind(this), { port: port });
    }

    async handler(request: Request):Promise<Response> {
        const plugins = this.plugins;

        const url = new URL(request.url)
        console.log(`[${request.method}] ${url.pathname}`);
        let res:Response|void;
        for (let i = 0; i < plugins.length; i++) {
            const plugin = plugins[i];
            if (plugin.filter) {
                const url = new URL(request.url);
                const filepath = decodeURIComponent(url.pathname);
                if (!plugin.filter.test(filepath)) {
                    continue;
                }
            }
            try{
                res = await Promise.resolve(plugin.handler(request));
            }catch(ex){
                console.log(ex)
            }
            if (res) {
                break;
            }
        }
        if (!res) {
            res = new Response(`<h1>500</h1>\n\n${request.url} no handler`, {
                status: 500,
                headers: {
                    "Content-Type": "text/html; charset=utf-8"
                }
            })
        }

        res.headers.set('Access-Control-Allow-Origin', '*')
        res.headers.set('Access-Control-Allow-Headers', 'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method' )
        res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
        res.headers.set('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')

        return res;
    }
}
