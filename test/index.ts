import { path ,url } from '../deps.ts'
import {Server,createStatic} from '../mod.ts'
import apiMiddle from './api.ts'
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = new Server();

const handle = createStatic(path.join(__dirname,'./public'));

app.use(apiMiddle)

app.use(handle);

app.use(function(request){
    const body = `<h1>404</h1>\n\n${request.url}`;
    return new Response(body, {
      status: 404,
      headers:{
        "Content-Type":"text/html; charset=utf-8"
      }
    })
})

app.listen(3000)