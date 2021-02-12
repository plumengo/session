const uuid = require('uuid')
//const cookie = require('cookie')
const crypto = null//require('plumengo/crypto/crypto')
const cache = require('node-cache')

let store = null

// default options
function init(opts) {
    if (opts == undefined) opts = {}

    opts.key = opts.key || 'plumengo.key'
    opts.maxAge = opts.maxAge || (3600 * 1000)
    opts.store = opts.store || 'node-cache'

    switch(opts.store) {
        case 'node-cache':
            store = new cache()
            break;
        default:
            store = new cache()
    }

    return opts
}

// session middleware
function session(sessionClass, opts) {
    // init default options
    init(opts)

    return async function (ctx, next) {
        // get key from cookies
        let encrypted = ctx.cookies.get(opts.key)

        if (encrypted == undefined) {
            let session = new sessionClass()
            // encrypt session object
            encrypted = crypto.encrypt(JSON.stringify(session))
            // store session in cookies
            ctx.cookies.set(opts.key, encrypted, { httpOnly: false, expires: new Date(opts.maxAge + Date.now()) })
            // store session in opts.store
            store.set(encrypted, session, opts.maxAge)
            // set ctx.session
            ctx.session = JSON.parse(JSON.stringify(session))
        } else {
            // check session in opts.store
            let session = store.get(encrypted)

            if (session == undefined) {
                session = crypto.decrypt(encrypted)
                // store session in opts.store
                store.set(encrypted, session, opts.maxAge)
            }
            // set ctx.session
            ctx.session = JSON.parse(JSON.stringify(session))
        }
        // next middleware
        await next()
    };
}

module.exports = session
