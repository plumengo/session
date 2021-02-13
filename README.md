# session
## session middleware for Koa
usage:
```
const Koa = require('koa')
const Router = require('koa-router')
const favicon = require('koa-favicon')
const static = require('koa-static')
**const session = require('plumengo-session')**
const uuid = require('uuid')

const PORT = 3000
const app = new Koa()
const router = new Router()

app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(static(__dirname + '/public'))
app.use(router.routes())
app.use(router.allowedMethods())

**class Session {
    constructor() {
        this.id = uuid.v4()
        this.client = {
            id: uuid.v4(),
            token: uuid.v4()
        }
    }
}**

**let opts = {
  key: 'koa.session',
  store: 'node-cache',
  maxAge: 3600000
}**

**router.use(session(Session, opts))**

router.get('/', async (ctx, next) => {
    console.log(ctx.session)

    ctx.type = 'html'
    ctx.body = 'session: <br/>'
    ctx.body += JSON.stringify(ctx.session)
})

app.listen(PORT);

```
