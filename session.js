const uuid = require('uuid')
const crypto = require('plumengo-crypto')
const cache = require('node-cache')

let store = null

// default options
function init(opts) {
    if (opts == undefined) opts = {}

    opts.key = opts.key || 'plumengo.key'
    opts.maxAge = opts.maxAge || (3600 * 1000)
    opts.store = opts.store || 'node-cache'

    switch (opts.store) {
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
        let session, jsonString, jsonObject

        // get encrypted value of opts.key from cookies 
        let encrypted = ctx.cookies.get(opts.key)

        if (encrypted == undefined) {
            session = new sessionClass()
            jsonString = JSON.stringify(session)
            jsonObject = JSON.parse(jsonString)

            // encrypt JSON string os session object
            encrypted = crypto.encrypt(jsonString)
            // store encrypted value of jsonString in cookies in opts.key
            ctx.cookies.set(opts.key, encrypted, { httpOnly: false, expires: new Date(opts.maxAge + Date.now()) })
            
        } else {
            // check session in store or decrypt encrypted value
            session = store.get(encrypted) || JSON.parse(crypto.decrypt(encrypted))
            jsonString = JSON.stringify(session)
            jsonObject = JSON.parse(jsonString)
        }

        // store jsonObject in store
        store.set(encrypted, jsonObject, opts.maxAge)
        // set ctx.session to jsonObject
        ctx.session = jsonObject

        // next middleware
        await next()
    };
}

module.exports = session
